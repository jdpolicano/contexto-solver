import { parentPort, workerData } from 'node:worker_threads';
import got from "got";

const { baseUrl, words, childId } = workerData;

let checkInInterval = 100;
let count = 0;
let bestMatch;

for (const word of words) {
  try {
    const res = await got(`${baseUrl}${word}`).json();

    if (res.distance === 0) {
      parentPort.postMessage({ word, found: true });
      process.exit(0);
    }

    if (bestMatch === undefined) {
      bestMatch = res;
    };

    if (res.distance < bestMatch.distance) {
      bestMatch = res;
    };
  } catch(_) {}

  count += 1;
  
  if (count % checkInInterval === 0) {
    console.log(`${childId}: Processed ${count} words total`);
    console.log(`${childId}: Best so far "${bestMatch?.word}" - ${bestMatch?.distance}`);
  }
}


parentPort.postMessage({ word: bestMatch?.word, found: false });
process.exit(0);
