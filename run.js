import fs from "node:fs/promises";
import os from "node:os";
import { Worker } from "node:worker_threads";

const baseUrl = "https://api.contexto.me/machado/en/game/481/";
const file = await fs.readFile("./assets/lemmas.txt", { encoding: "utf8" });
const words = file.split("\n");

let maxChildren = os.cpus().length - 1;
let chunkSize = Math.ceil(words.length / maxChildren);
let base = 0;

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
      if (data.found === true) {
        for (let i = 0 ; i < workerRefs.length; i++) {
          if (i !== idx) {
            workerRefs[i].terminate();
          }
        }
        return resolve(data);
      };
      console.log(`Child #${idx} Couldn't find word. Best Guess -> ${data.word} : ${data.distance}`);
      return reject();
    });
    
    worker.on("error", (err) => reject(err));
    worker.on("exit", (code) => console.log(`Child ${idx} exited with code (${code})`));


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