import fs from "node:fs/promises";
import os from "node:os";
import { Worker } from "node:worker_threads";

function closeRefs(refs, idxToIgnore = 0) {
  for (let i = 0 ; i < refs.length; i++) {
    if (i !== idxToIgnore) {
      refs[i].terminate();
    }
  }
}

export default async function solve(puzzleNumber) {
  if (!puzzleNumber || typeof puzzleNumber !== 'number') throw new Error("puzzle number is required.");

  const baseUrl = `https://api.contexto.me/machado/en/game/${puzzleNumber}/`;
  const file = await fs.readFile("./assets/lemmas.txt", { encoding: "utf8" });
  const words = file.split("\n");
  
  let maxChildren = os.cpus().length - 1;
  let chunkSize = Math.ceil(words.length / maxChildren);
  let base = 0;
  let gracefulShutdown = false;
  
  // will use this to cancel the other children after one succeeds.
  const workerRefs = [];
  
  const workers = new Array(maxChildren).fill(null).map((_, idx) => {
    return new Promise((resolve, reject) => {
      // console.log(words.slice(base, Math.min(base + chunkSize, words.length)));
      const worker = new Worker("./solver.js", {
        workerData: {
          words: words.slice(base, Math.min(base + chunkSize, words.length)),
          childId: idx,
          baseUrl,
        }
      });
  

      worker.on("message", (data) => {
        gracefulShutdown = true;
        if (data.found === true) {
          closeRefs(workerRefs, idx);
          return resolve(data);
        };
        console.log(`Child #${idx} Couldn't find word. Best Guess -> ${data.word} : ${data.distance}`);
        return reject();
      });
      
      worker.on("error", (err) => reject(err));
      worker.on("exit", (code) => {
        if (!gracefulShutdown) {
          console.log(`Graceful shutdown failed. Child #${idx} exited with code (${code}).`);
          closeRefs(workerRefs, idx);
          return reject();
        }
        console.log(`Child ${idx} exited with code (${code})`);
      });
  
  
      workerRefs.push(worker);
      base += chunkSize;
    });
  })
  
  try {
    const { word } = await Promise.any(workers);
    console.log(`The word is "${word}"`);
  } catch (err) {
    console.log("unable to find word from wordlist.");
  }
}