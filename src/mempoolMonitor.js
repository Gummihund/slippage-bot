require('dotenv').config();
const { Alchemy, Network } = require('alchemy-sdk');
const ethers = require('ethers');

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(config);

async function startMempoolMonitor() {
  console.log('🚀 Mempool-Überwachung gestartet...');

  try {
    // Verbindung explizit aufbauen → Lazy-Connection vermeiden!
    console.log("⚡️ Initialisiere WebSocket-Verbindung...");
    alchemy.ws.on("block", (blockNumber) => {
      console.log(`✅ Verbindung steht – Neuer Block: ${blockNumber}`);
    });

    // 🔥 Auf 'pending' hören und Details nachladen
    alchemy.ws.on("pending", async (txHash) => {
      try {
        // 🚀 Hol die vollständigen Transaktionsdetails
        const tx = await alchemy.core.getTransaction(txHash);

        if (tx) {
          console.log(`💡 Neue TX erkannt: ${tx.hash}`);
          console.log(`➡️ Von: ${tx.from}`);
          console.log(`➡️ Zu: ${tx.to}`);
          console.log(`💰 Betrag: ${ethers.utils.formatEther(tx.value)} ETH`);
          console.log(`⛽️ Gaspreis: ${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
          console.log(`🔥 Max Fee Per Gas: ${tx.maxFeePerGas ? ethers.utils.formatUnits(tx.maxFeePerGas, 'gwei') : 'n/a'} Gwei`);
          console.log(`🔋 Nonce: ${tx.nonce}`);
          console.log('-----------------------------------');
        }
      } catch (error) {
        console.error(`❌ Fehler beim Laden der Transaktionsdetails: ${error.message}`);
      }
    });

    // Fehler-Handling direkt hinzufügen
    alchemy.ws.on("error", (error) => {
      console.error(`❌ Fehler im Event-Stream: ${error.message}`);
    });

  } catch (error) {
    console.error(`❌ Verbindung fehlgeschlagen: ${error.message}`);
  }
}

startMempoolMonitor();






