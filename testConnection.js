require('dotenv').config();
const { Alchemy, Network } = require('alchemy-sdk');

const networks = [
  Network.ETH_SEPOLIA,  // Sepolia zuerst testen
  Network.ETH_GOERLI,   // Wenn Sepolia fehlschlägt → Goerli
  Network.ETH_MAINNET   // Wenn Goerli auch fehlschlägt → Mainnet
];

let currentNetworkIndex = 0;

function getCurrentNetwork() {
  return networks[currentNetworkIndex];
}

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: getCurrentNetwork(),
  timeout: 5000, // 5 Sekunden Timeout
  maxRetries: 5  // Maximal 5 Versuche
};

const alchemy = new Alchemy(config);

async function testConnection() {
  console.log(`🚀 Verbindung wird getestet auf: ${getCurrentNetwork()}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort(); // Nach 5 Sekunden abbrechen
    }, 5000);

    const blockNumber = await alchemy.core.getBlockNumber({ signal: controller.signal });
    clearTimeout(timeout);
    console.log(`✅ Aktueller Block auf ${getCurrentNetwork()}: ${blockNumber}`);
  } catch (error) {
    console.error(`❌ Verbindung fehlgeschlagen: ${error.message}`);

    if (currentNetworkIndex < networks.length - 1) {
      // 🔄 Netzwerk wechseln und neu verbinden
      currentNetworkIndex++;
      console.log(`🔄 Versuche es auf: ${getCurrentNetwork()}...`);
      await testConnection();
    } else {
      console.error('❌ Alle Netzwerke sind aktuell nicht erreichbar!');
    }
  }
}

testConnection();
