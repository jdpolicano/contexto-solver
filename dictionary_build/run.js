import fs from "node:fs/promises";
import os from "node:os";
import { Worker } from "node:worker_threads";

const file = await fs.readFile("./dic.txt", { encoding: "utf8" });
const words = file.split("\n");

let maxChildren = os.cpus().length - 1;
let chunkSize = Math.ceil(words.length / maxChildren);
let base = 0;


const workers = new Array(maxChildren).fill(null).map(() => {
  return new Promise((resolve, reject) => {
    // console.log(words.slice(base, Math.min(base + chunkSize, words.length)));
    const worker = new Worker("./worker.js", {
      workerData: words.slice(base, Math.min(base + chunkSize, words.length))
    })

    worker.on("message", (data) => resolve(data));
    worker.on("error", (err) => reject(err));
    worker.on("exit", (code) => console.log("Child exited with code " + code));
    base += chunkSize;
  })
})

const data = await Promise.all(workers);
const flattened = data.flat();
await fs.writeFile("validWords.json", JSON.stringify(flattened));