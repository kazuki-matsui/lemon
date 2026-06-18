import Parser from "./parser";
import fs from "fs";
const data = fs.readFileSync("orange.lemon", "utf8")

repl()

async function repl () {
    const parser = new Parser()
    const program = parser.produceAST(data)
    console.log(data)
}