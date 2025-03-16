import dotenv from 'dotenv';
import { ethers } from 'ethers';
import TelegramBot from 'node-telegram-bot-api';
import PQueue from 'p-queue';

dotenv.config();

const {
  ETHEREUM_ALCHEMY_URL,
  ETHEREUM_QUICKNODE_URL,
  POLYGON_ALCHEMY_URL,
  ARBITRUM_ALCHEMY_URL,
  BNB_ALCHEMY_URL,
  WALLET_PRIVATE_KEY,
  TARGET_ADDRESS,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID
} = process.env;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
const MIN_AMOUNT = ethers.parseEther('0.002');
const queue = new PQueue({ concurrency: 5 });

const NETWORKS = [
  { name: "Ethereum Mainnet (Alchemy)", url: ETHEREUM_ALCHEMY_URL, websocket: true },
  { name: "Ethereum Mainnet (QuickNode)", url: ETHEREUM_QUICKNODE_URL, websocket: true },
  { name: "Polygon Mainnet (Alchemy)", url: POLYGON_ALCHEMY_URL, websocket: true },
  { name: "BNB Smart Chain (Alchemy)", url: process.env.BNB_ALCHEMY_URL, websocket: false },
  { name: "Arbitrum One (Alchemy)", url: ARBITRUM_ALCHEMY_URL, websocket: false },
];

async function performArbitrage(tx, provider, networkName) {
  try {
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const gasPrice = (await provider.getFeeData()).gasPrice;

    const transaction = await wallet.sendTransaction({
      to: TARGET_ADDRESS,
      value: tx.value,
      gasPrice,
      gasLimit: 21000,
    });

    await bot.sendMessage(TELEGRAM_CHAT_ID, `[${networkName}] ✅ Arbitrage erfolgreich: ${transaction.hash}`);
    console.log(`[${networkName}] ✅ Arbitrage erfolgreich: ${transaction.hash}`);
  } catch (error) {
    await bot.sendMessage(TELEGRAM_CHAT_ID, `[${networkName}] ❌ Arbitrage fehlgeschlagen: ${error.message}`);
    console.error(`[${networkName}] ❌ Arbitrage fehlgeschlagen: ${error.message}`);
  }
}

async function monitorWebsocket(network) {
  const provider = new ethers.WebSocketProvider(network.url);
  provider.on("pending", (txHash) => {
    queue.add(async () => {
      try {
        const tx = await provider.getTransaction(txHash);
        if (tx && tx.to && tx.value && ethers.getBigInt(tx.value) >= MIN_AMOUNT) {
          await performArbitrage(tx, provider, network.name);
        }
      } catch (error) {
        console.error(`[${network.name}] Fehler: ${error.message}`);
      }
    });
  });

  provider.websocket.on("error", (err) =>
    console.error(`[${network.name}] WS-Fehler:`, err.message)
  );

  provider.websocket.on("close", () =>
    console.log(`[${network.name}] WS geschlossen.`)
  );

  console.log(`🚀 Monitoring gestartet auf: ${network.name}`);
}

async function monitorPolling(network) {
  const provider = new ethers.JsonRpcProvider(network.url);
  let lastBlock = await provider.getBlockNumber();

  setInterval(async () => {
    try {
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock > lastBlock) {
        const block = await provider.getBlock(currentBlock, true);
        for (const tx of block.transactions) {
          if (tx.to && tx.value && ethers.getBigInt(tx.value) >= MIN_AMOUNT) {
            await performArbitrage(tx, provider, network.name);
          }
        }
        lastBlock = currentBlock;
      }
    } catch (error) {
      console.error(`[${network.name}] Block-Fehler: ${error.message}`);
    }
  }, 5000);
  console.log(`🚀 Monitoring gestartet auf: ${network.name}`);
}

NETWORKS.forEach(network => {
  if (network.websocket) {
    monitorWebsocket(network);
  } else {
    monitorPolling(network);
  }
});

console.log("🤖 Multi-Netzwerk Arbitrage-Bot gestartet!");






