import fs from "fs";
import tokenize from "./frontEnd/lexer";
import parse from "./frontEnd/parser";
import evaluate from "./frontEnd/interpreter"
console.dir(evaluate(fs.readFileSync("orange" + '.lemon', "utf8")), { depth: null })

