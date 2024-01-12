import { parentPort, workerData } from 'node:worker_threads';
import got from "got";

const baseUrl = "https://api.contexto.me/machado/en/game/477/";
const validWords = [];

let checkInInterval = 1000;
let count = 0;

for (const word of workerData) {
  try {
    const res = await got(`${baseUrl}${word}`).json();
    validWords.push(res);
  } catch(_) {}

  count += 1;
  
  if (count % checkInInterval === 0) {
    console.log(`Processed ${count} words total`);
    console.log(`Processed ${validWords.length} valid words`);
  }
}

parentPort.postMessage(validWords);