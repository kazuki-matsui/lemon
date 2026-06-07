import fs from 'fs';
import {Statement, Program, Expression, Identifier} from "./ast"
import {Token, tokenize, TokenType} from "./lexer";

const file = fs.readFileSync("grapefruit.lemon", "utf8")

export default class Parser {
    private tokens: Token[] = []
    private at() {
        return this.tokens[0] as Token
    }
    private eat() {
        return this.tokens.shift() as Token
    }
    public produceAST (data: string): Program {
        this.tokens = tokenize(data)
        const program: Program = {
            kind: "Program",
            body: [],
        }

        while(this.tokens[0].type != TokenType.EndOfFile) {
            program.body.push(this.parseStatement())
        }
        return program
    }

    private parseStatement (): Statement {
        return this.parseExpression()
    }
    private parseExpression (): Expression {
        return this.parsePrimaryExpression()
    }
    private parsePrimaryExpression (): Expression {
        switch (this.tokens[0].type) {
            case TokenType.Identifier: return {kind: "Identifier", symbol: this.eat().value} as Identifier;
            default: return {} as Statement
        }
    }
}