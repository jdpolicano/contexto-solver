import fs from "node:fs/promises"; 

const data = JSON.parse(await fs.readFile("./validWords.json"));

async function processLemmas(data) {
  const word_map = new Map();
  const lemmas = data
    .map(entry => entry.lemma)
    .filter(lemma => {
      if (!word_map.has(lemma)) {
        word_map.set(lemma, true);
        return true;
      }
      return false
    })

  lemmas.sort();
  console.log("lemmas -> ", lemmas.length);
  const file = lemmas.join("\n");
  await fs.writeFile("lemmas.txt", file);
};

async function processWords(data) {
  const wordMap = new Map();
  const words = data
    .map(entry => entry.word)
    .filter(word => {
      if (!wordMap.has(word)) {
        wordMap.set(word);
        return true;
      }

      return false;
    })
    
  words.sort();
  console.log("words -> ", words.length);
  const file = words.join("\n");
  await fs.writeFile("updated_dict.txt", file);
};

await processLemmas(data);
await processWords(data);