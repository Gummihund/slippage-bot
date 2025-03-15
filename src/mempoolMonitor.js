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

  // RICHTIGER EVENTNAME → "alchemy_pendingTransaction"
  alchemy.ws.on("alchemy_pendingTransaction", (tx) => {
    console.log(`💡 Neue TX erkannt: ${JSON.stringify(tx, null, 2)}`);

    if (tx.gasPrice) {
      console.log(`⛽️ Gaspreis erkannt: ${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
    }

    if (tx.to) {
      console.log(`➡️ Empfängeradresse: ${tx.to}`);
    }

    if (tx.value) {
      console.log(`💰 Überweisungsbetrag: ${ethers.utils.formatUnits(tx.value, 'ether')} ETH`);
    }
  });

  // Fehler-Handling direkt hinzufügen
  alchemy.ws.on("error", (error) => {
    console.error(`❌ Fehler im Event-Stream: ${error.message}`);
  });
}

startMempoolMonitor();


