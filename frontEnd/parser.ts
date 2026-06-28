import {
    ArrayLiteral,
    Assignment,
    BinaryExpression,
    BooleanLiteral,
    Break,
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
    Statement,
    StringLiteral
} from "./ast"
import tokenize, {Token, TokenType} from "./lexer"

const precedence = [
    "&", "|",
    "∈", "!=", "=", ">", "<",
    "+", "-",
    "*", "/", "%",
    "^", "√"
]
let tokens: Token[] = []
let program: Program = {} as Program
function tokenTypeOf(tokens: Array<Token>, type: TokenType) {
    for(let i = 0; i <= tokens.length; i++) {
        if(tokens[i]?.type === type) {
            return i
        }
    }
}
export default function parse(sourceCode: string): Program {
    tokens = tokenize(sourceCode)
    program = {kind: "Program", body: []}
    while (tokens[0].type != TokenType.EndOfFile) {
        program.body.push(parseStatement())
    }
    return program
}





function parseStatement(): Statement {
    if(tokens[1]?.type == TokenType.Assignment || tokens[2]?.type == TokenType.Assignment) {
        let constant = false
        if(tokens[0]?.type == TokenType.Constant) {
            tokens.shift()
            constant = true
        }
        const identifier = parsePrimaryExpression()
        tokens.shift()
        return {kind: "Assignment", constant, identifier, value: parseExpression()} as Assignment
    } else if(tokens[1]?.type == TokenType.Mutation) {
        const referencing = parsePrimaryExpression()
        tokens.shift()
        return {kind: "Mutation", referencing, value: parseExpression()} as Mutation
    } else if(tokens[0]?.type == TokenType.Logic) {
        return {kind: "Logic", type: tokens.shift().value, parameters: parseExpression(), body: parseObject()} as Logic
    } else if(tokens[0]?.type == TokenType.Function) {
        tokens.shift()
        let functionStatement = {kind: "Function", symbol: tokens.shift().value, parameters: parseArray(), return: parseExpression(), body: {}} as Function
        tokens.shift()
        functionStatement.body = parseObject()
        return functionStatement
    } else if(tokens[0]?.type == TokenType.Constant && tokens[2]?.type == TokenType.OpenSquareBracket) {
        tokens.shift()
        const reference = {kind: "FunctionReference", constant: true, referencing: {kind: "Identifier", symbol: tokens.shift().value}, parameters: parseArray()} as FunctionReference
        tokens.shift()
        tokens.shift()
        return reference
    } else if(tokens[tokenTypeOf(tokens, TokenType.ClosedSquareBracket) + 1]?.type == TokenType.OpenParenthesis) {
        const reference = {kind: "FunctionReference", constant: false, referencing: {kind: "Identifier", symbol: tokens.shift().value}, parameters: parseArray()} as FunctionReference
        tokens.shift()
        tokens.shift()
        return reference
    } else {
        const left = parsePrimaryExpression()
        if(tokens[0]?.type == TokenType.Constant) {
            tokens.shift()
            return {kind: "Assignment", constant: true, identifier: left, value: parseExpression()} as Assignment
        } else if(tokens[0]?.type == TokenType.Assignment) {
            tokens.shift()
            return {kind: "Assignment", constant: true, identifier: left, value: parseExpression()} as Assignment
        } else if(tokens[0]?.type == TokenType.Mutation) {
            tokens.shift()
            return {kind: "Mutation", referencing: left, value: parseExpression()} as Mutation
        } else {
            // console.log("Unexpected token found while parsing statement" + tokens[0]?.value + " " + tokens[1]?.value + " " + tokens[2]?.value)
            tokens.shift()
        }
    }
}
function parseExpression(minPrecedence = 0): Expression {
    let left = parsePrimaryExpression()
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
function parsePrimaryExpression(): Expression {
    if(tokens[0]?.type == TokenType.Constant && tokens[1]?.type == TokenType.Reference || tokens[0]?.type == TokenType.Reference) {
        if(tokens[0].value.includes(".")) {
            const references = tokens.shift().value.split(".")
            const root: MemberReference = {
                kind: "MemberReference",
                referencing: { kind: "Reference", symbol: references[0] }
            }
            let current = root
            for (const reference of references.slice(1)) {
                current = current.property = {
                    kind: "MemberReference",
                    referencing: { kind: "Reference", symbol: reference }
                }
            }
            return root
        } else if(tokens[0]?.type == TokenType.Constant && tokens[2]?.type == TokenType.OpenSquareBracket) {
            tokens.shift()
            const reference = {kind: "FunctionReference", constant: true, referencing: {kind: "Identifier", symbol: tokens.shift().value}, parameters: parseArray()} as FunctionReference
            tokens.shift()
            tokens.shift()
            return reference
        } else if(tokens[tokenTypeOf(tokens, TokenType.ClosedSquareBracket) + 1]?.type == TokenType.OpenParenthesis) {
            const reference = {kind: "FunctionReference", constant: false, referencing: {kind: "Identifier", symbol: tokens.shift().value}, parameters: parseArray()} as FunctionReference
            tokens.shift()
            tokens.shift()
            return reference
        } else {
            // @ts-ignore
            return {kind: "Reference", symbol: tokens.shift().value, index: tokens[0]?.type == TokenType.OpenSquareBracket ? parseArray()[0] : undefined} as Reference
        }
    } else {
        switch (tokens[0]?.type) {
            case TokenType.Break:
                tokens.shift()
                return {kind: "Break"} as Break
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
                console.log("Unexpected token found while parsing expression", tokens[0])
                tokens.shift()
        }
    }
}