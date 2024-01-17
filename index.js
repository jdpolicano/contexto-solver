import { Command } from "commander";
import solve from "./run.js";

const program = new Command();

program
    .requiredOption("-d, --day <puzzle #>", "the puzzle number to try to solve.")
    .action((options) => { 
        options.day = parseInt(options.day);
    })
    .parse(process.argv);


await solve(program.opts().day);

