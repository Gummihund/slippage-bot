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

    // Sobald die Verbindung steht → Events auflisten
    setTimeout(() => {
      if (alchemy.ws._events) {
        console.log('👉 Verfügbare Events:', Object.keys(alchemy.ws._events));
      }
    }, 2000);

    // ✅ ALTERNATIVE EVENT-NAMEN TESTEN
    const eventNames = [
      "alchemy_newPendingTransactions", // Wahrscheinlich die richtige Schreibweise ✅
      "alchemy_filteredPendingTransactions",
      "alchemy_newFullPendingTransactions",
      "pending"
    ];

    // 🔥 Direkt alle Events durchtesten
    for (const eventName of eventNames) {
      alchemy.ws.on(eventName, (tx) => {
        console.log(`💡 [${eventName}] Neue TX erkannt: ${JSON.stringify(tx, null, 2)}`);

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
    }

    // Fehler-Handling hinzufügen
    alchemy.ws.on("error", (error) => {
      console.error(`❌ Fehler im Event-Stream: ${error.message}`);
    });

  } catch (error) {
    console.error(`❌ Verbindung fehlgeschlagen: ${error.message}`);
  }
}

startMempoolMonitor();




