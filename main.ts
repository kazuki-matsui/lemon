import parse from "./frontEnd/NewParser";
import tokenize from "./frontEnd/lexer";
import fs from "fs";
console.dir(parse(fs.readFileSync("orange.lemon", "utf8")), { depth: null })