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

  // Event für Pending Transactions überwachen
  alchemy.ws.on('pendingTransactions', (tx) => {
    if (tx.gasPrice) {
      console.log(`⛽️ Hoher Gaspreis erkannt: ${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
    }
  });
}

startMempoolMonitor();
