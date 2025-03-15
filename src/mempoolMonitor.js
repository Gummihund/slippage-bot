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
          console.log(`➡️ Zu: ${tx.to || '❌ (Kein Empfänger)'}`);

          // ✅ Wert nur loggen, wenn vorhanden
          if (tx.value) {
            console.log(`💰 Betrag: ${ethers.utils.formatEther(tx.value)} ETH`);
          } else {
            console.log(`💰 Betrag: ❌ Kein Wert (Contract Call?)`);
          }

          // ✅ Gaspreis prüfen
          if (tx.gasPrice) {
            console.log(`⛽️ Gaspreis: ${ethers.utils.formatUnits(tx.gasPrice, 'gwei')} Gwei`);
          } else {
            console.log(`⛽️ Gaspreis: ❌ Nicht verfügbar`);
          }

          // ✅ Max Fee per Gas prüfen
          if (tx.maxFeePerGas) {
            console.log(`🔥 Max Fee Per Gas: ${ethers.utils.formatUnits(tx.maxFeePerGas, 'gwei')} Gwei`);
          } else {
            console.log(`🔥 Max Fee Per Gas: ❌ Nicht verfügbar`);
          }

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







