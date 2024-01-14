import { parentPort, workerData } from 'node:worker_threads';
import got from "got";

let { baseUrl, words, childId } = workerData;


let checkInInterval = 100;
let chunkSize = 10;
let base = 0;
let count = 0;
let bestMatch;

function* getChunk() {
  while (base < words.length) {
    let slice = words.slice(base, Math.min(base + chunkSize, words.length));
    yield slice;
    base += chunkSize;
  }
}

for (const chunk of getChunk()) {
  const requests = chunk.map(word => {
      return got(`${baseUrl}${word}`)
        .json()
        .catch(e => { error: e.message })
  });

  const responses = await Promise.all(requests);
  
  for (const res of responses) {
    if (!res.error) {
      if (res.distance === 0) {
        parentPort.postMessage({ word: res.word, found: true });
        process.exit(0);
      }

      if (bestMatch === undefined) {
        bestMatch = res;
      };

      if (res.distance < bestMatch.distance) {
        bestMatch = res;
      };
    }
  }

  count += chunkSize;
  
  if (count % checkInInterval === 0) {
    console.log(`${childId}: Processed ${count} words total`);
    console.log(`${childId}: Best so far "${bestMatch?.word}" - ${bestMatch?.distance}`);
  }
}


parentPort.postMessage({ word: bestMatch?.word, found: false });
process.exit(0);
