import fs from "fs";
import tokenize from "./frontEnd/lexer";
import parse from "./frontEnd/parser";
import evaluate from "./frontEnd/interpreter"
console.dir(parse(fs.readFileSync("orange" + '.lemon', "utf8")), { depth: null })
console.log()
// console.dir(evaluate(fs.readFileSync("grapefruit" + '.lemon', "utf8")), { depth: null })

