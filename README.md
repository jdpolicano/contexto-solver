## overview
A brute force approach to solving the popular word game [contexto](https://contexto.me/). The game is played by guessing words that are related to a given word. The goal is to use the information given by the game to find the correct word in the least amount of guesses possible. This program runs through all the possible known words (the list is unverified to be complete, but appears to work nearly all of the time) and submiting them directly throught the contexto api until the correct word is found. The hope is to expand this and figure out an efficent way to reduce the number of requests needed to find the correct word without brute forcing the entire dictionary.

## Usage
make sure you have Node 16+ installed

clone this repo
```bash
git clone https://github.com/jdpolicano/contexto-solver.git
```

install
```bash
npm install
```

run
```bash
node index.js -d <the day's puzzle to solve>
```