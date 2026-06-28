import {
    ArrayLiteral,
    Assignment,
    BinaryExpression,
    BooleanLiteral, Break,
    Expression,
    Function,
    FunctionReference,
    Identifier,
    Logic,
    MemberReference,
    Mutation,
    NullLiteral,
    NumericLiteral,
    ObjectLiteral,
    Program,
    Reference,
    Statement,
    StringLiteral
} from "./ast"
import tokenize, {Token, TokenType} from "./lexer"

const precedence = [
    "&", "|",
    ":", "!=", "=", ">", "<",
    "+", "-",
    "*", "/", "%",
    "^", "√"
]
let tokens: Token[] = []
let program: Program = {} as Program
export default function parse(sourceCode: string): Program {
    tokens = tokenize(sourceCode)
    program = {kind: "Program", body: []}
    while (tokens[0].type != TokenType.EndOfFile) {
        const statement = parseStatement()
        if(statement == undefined) {
            break
        }
        program.body.push(statement)
    }
    return program
}





function parseStatement(): Statement {
    if(tokens[0]?.type == TokenType.Break) {
        tokens.shift()
        return {kind: "Break"} as Break
    }
    if(tokens[0]?.type == TokenType.Logic) {
        return {kind: "Logic", type: tokens.shift().value, parameters: parseExpression(), body: parseObject()} as Logic
    } else if(tokens[0]?.type == TokenType.Function) {
        tokens.shift()
        let functionStatement = {kind: "Function", symbol: tokens.shift().value, parameters: parseArray(), return: parseExpression(), body: {}} as Function
        tokens.shift()
        functionStatement.body = parseObject()
        return functionStatement
    } else {
        if(tokens[0]?.type == TokenType.Constant) {

            if(tokens[2]?.type == TokenType.OpenSquareBracket) {
                return parseMemberExpression()
            }
            tokens.shift()
            const identifier = parseMemberExpression()
            tokens.shift()
            return {kind: "Assignment", constant: true, identifier, value: parseExpression()} as Assignment
        } else {
            const left = parseMemberExpression()
            if(left?.kind == "FunctionReference") {
                return left
            } else if(tokens[0]?.type == TokenType.Assignment) {
                tokens.shift()
                return {kind: "Assignment", constant: false, identifier: left, value: parseExpression()} as Assignment
            } else if(tokens[0]?.type == TokenType.Mutation) {
                tokens.shift()
                return {kind: "Mutation", referencing: left, value: parseExpression()} as Mutation
            } else {
                console.log("Unexpected token found while parsing statement   " + tokens.shift().value)
                return undefined
            }
        }
    }
}
function parseExpression(minPrecedence = 0): Expression {
    let left = parseMemberExpression()
    while (tokens[0]?.type == TokenType.BinaryOperator && precedence.indexOf(tokens[0].value) >= minPrecedence) {
        const operation = tokens.shift().value
        const currentPrecedence = precedence.indexOf(operation)
        let right = parseExpression(currentPrecedence + 1)
        left = {
            kind: "BinaryExpression",
            left: left,
            operation,
            right
        } as BinaryExpression
    }
    return left
}
function parseMemberExpression(): Expression {
    if(tokens[0]?.type == TokenType.Constant && tokens[1]?.type == TokenType.Reference || tokens[0]?.type == TokenType.Reference) {
        if(tokens[1]?.type == TokenType.Dot) {
            let reference = {
                kind: "MemberReference",
                referencing: {kind: "Reference", symbol: tokens.shift().value} as Reference
            } as MemberReference
            let current = reference
            // @ts-ignore
            while (tokens[0]?.type == TokenType.Dot) {
                tokens.shift()
                current.property = {
                    kind: "MemberReference",
                    referencing: parseReferenceExpression()
                }
                current = current.property
            }
            return reference
        }
        return parseReferenceExpression()
    }
    return parsePrimaryExpression()
}
function parseReferenceExpression(): Expression {
    if(tokens[0]?.type == TokenType.Constant && tokens[2]?.type == TokenType.OpenSquareBracket) {
        tokens.shift()
        const reference = {kind: "FunctionReference", constant: true, referencing: {kind: "Identifier", symbol: tokens.shift().value}, parameters: parseArray()} as FunctionReference
        tokens.shift()
        tokens.shift()
        return reference
    } else if(tokens[1]?.type == TokenType.OpenSquareBracket) {
        const symbol = tokens.shift().value
        const parameters = parseArray()
        if(tokens[0].type == TokenType.OpenParenthesis) {
            tokens.shift()
            tokens.shift()
            return {kind: "FunctionReference", constant: false, referencing: {kind: "Identifier", symbol}, parameters} as FunctionReference
        } else {
            return {kind: "Reference", symbol, index: parameters[0]} as Reference
        }
    } else {
        return {kind: "Reference", symbol: tokens.shift().value} as Reference
    }
}
function parsePrimaryExpression(): Expression {
    switch (tokens[0]?.type) {
        case TokenType.Identifier:
            return {kind: "Identifier", symbol: tokens.shift().value} as Identifier
        case TokenType.String:
            return {kind: "StringLiteral", value: tokens.shift().value} as StringLiteral
        case TokenType.Number:
            return {kind: "NumericLiteral", value: parseFloat(tokens.shift().value)} as NumericLiteral
        case TokenType.Minus:
            tokens.shift()
            return {kind: "NumericLiteral", value: -parseFloat(tokens.shift().value)} as NumericLiteral
        case TokenType.Boolean:
            return {kind: "BooleanLiteral", value: tokens.shift().value == "true"} as BooleanLiteral
        case TokenType.Null:
            tokens.shift()
            return {kind: "NullLiteral"} as NullLiteral
        case TokenType.OpenSquareBracket:
            return {kind: "ArrayLiteral", elements: parseArray()} as ArrayLiteral
        case TokenType.OpenCurlyBracket:
            return {kind: "ObjectLiteral", body: parseObject()} as ObjectLiteral
        case TokenType.OpenParenthesis: {
            tokens.shift()
            const expression = parseExpression()
            tokens.shift()
            return expression
        }
        default:
            console.log("Unexpected token found while parsing expression   " + tokens.shift().value)
            return undefined
    }
}
function parseObject(): Statement[] {
    tokens.shift()
    const body: Statement[] = []

    while (tokens[0]?.type != TokenType.ClosedCurlyBracket) {
        body.push(parseStatement())
    }
    tokens.shift()
    return body
}
function parseArray(): Expression[] {
    tokens.shift()
    const elements: Expression[] = []
    while(true) {
        if(tokens[0]?.type == TokenType.ClosedSquareBracket) {
            tokens.shift()
            break
        }
        elements.push(parseExpression())
        if (tokens[0]?.type == TokenType.Comma) {
            tokens.shift()
        } else {
            tokens.shift()
            break
        }
    }
    return elements
}