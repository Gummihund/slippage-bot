require('dotenv').config();
const { Alchemy, Network, AlchemySubscription } = require('alchemy-sdk');
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

    // 🔥 HARDCORE-Debug-Log → Alle verfügbaren Events auflisten
    setTimeout(() => {
      if (alchemy.ws._events) {
        console.log('👉 Verfügbare Events:', Object.keys(alchemy.ws._events));
      } else {
        console.log('❌ Keine Events registriert!');
      }

      if (alchemy.ws._websocket) {
        console.log(`✅ WebSocket Status: ${alchemy.ws._websocket.readyState}`);
      } else {
        console.log("❌ WebSocket ist nicht initialisiert!");
      }
    }, 3000);

    // ✅ TEST: Direkt auf verschiedene Varianten hören:
    const eventNames = [
      "alchemy_pendingTransactions", // Case-sensitive Variante
      "alchemy_pendingtransactions", // Klein geschrieben (wie im Error)
      "pending", // Allgemeine Pending-Transactions
      "alchemy_newPendingTransactions"
    ];

    for (const eventName of eventNames) {
      console.log(`🔎 Teste Event: ${eventName}`);
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

    // Fehler-Handling direkt hinzufügen
    alchemy.ws.on("error", (error) => {
      console.error(`❌ Fehler im Event-Stream: ${error.message}`);
    });

  } catch (error) {
    console.error(`❌ Verbindung fehlgeschlagen: ${error.message}`);
  }
}

startMempoolMonitor();





