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

  // Direkt auf die interne WebSocket-Instanz zugreifen
  if (alchemy.ws._websocket && alchemy.ws._websocket.readyState === 1) {
    console.log("✅ WebSocket-Verbindung aufgebaut");

    // Verfügbare Events ausgeben
    console.log('👉 Verfügbare Events:', Object.keys(alchemy.ws._events || {}));

    // Event aktivieren → Sicheren Event verwenden
    alchemy.ws.on("alchemy_newPendingTransactions", (tx) => {
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

    // Fehler-Handling hinzufügen
    alchemy.ws.on("error", (error) => {
      console.error(`❌ Fehler im Event-Stream: ${error.message}`);
    });

  } else {
    console.error("❌ WebSocket-Verbindung nicht verfügbar – wird neu aufgebaut...");

    // Neu verbinden, falls die Verbindung nicht verfügbar ist
    alchemy.ws._websocket.on("open", () => {
      console.log("✅ WebSocket erfolgreich wiederhergestellt");
    });

    alchemy.ws._websocket.on("error", (error) => {
      console.error(`❌ WebSocket-Fehler: ${error.message}`);
    });
  }
}

startMempoolMonitor();




