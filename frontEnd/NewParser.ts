import {ArrayLiteral, Assignment, BinaryExpression, BooleanLiteral, Break, ConditionalExpression, Expression, Function, FunctionReference, Identifier, ImportStatement, Logic, LogicalExpression, ModuleStatement, Mutation, NullLiteral, NumericLiteral, Program, Reference, Statement, StringLiteral
} from "./ast"
import tokenize, {Token, TokenType} from "./lexer"

let tokens: Token[] = []
let program: Program = {} as Program
export default function parse(sourceCode: string): Program {
    tokens = tokenize(sourceCode)
    program = {kind: "Program", body: []}
    while (tokens[0].type != TokenType.EndOfFile) {
        program.body.push(parseStatement())
    }
    return program
}





function parseStatement(): Statement {
    return {} as Statement
}