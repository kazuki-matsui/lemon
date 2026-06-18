import fs from 'fs';
import {Expression, Identifier, NumericLiteral, Program, Statement} from "./ast"
import {Token, tokenize, TokenType} from "./lexer"
const data = fs.readFileSync("orange.lemon", "utf8")

export default class Parser {
    tokens: Token[] = []
    at() {return this.tokens[0] as Token}
    eat() {return this.tokens.shift() as Token}

    produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode)
        const program: Program = {
            kind: "Program",
            body: []
        }
        while (this.tokens[0].type != TokenType.EndOfFile) {
            program.body.push(this.parseStatement())
        }
        return program
    }

    parseStatement(): Statement {return this.parseExpression()}
    parseExpression(): Expression {return this.parsePrimary()}
    parsePrimary(): Expression {
        const token = this.at().type
        switch (token) {
            case  TokenType.Identifier:
                return {kind: "Identifier", symbol: this.eat().value} as Identifier
            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral
            default:
                // console.error("Unexpected token found during parsing", this.at)
                return {} as Statement
        }
    }
}

