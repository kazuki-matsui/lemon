import {
    ArrayLiteral,
    Assignment,
    BinaryExpression,
    BooleanLiteral,
    Break,
    Expression,
    FunctionDeclaration,
    FunctionCall,
    Identifier,
    Import,
    Logic,
    MemberExpression,
    NullLiteral,
    NumericLiteral,
    ObjectLiteral,
    Program,
    Statement,
    StringLiteral,
} from "./ast"
import tokenize, {Token, TokenType} from "./lexer"

const precedence = [
    "&", "|",
    "!=", "==", "=>", "<=", ">", "<",
    "+", "-",
    "*", "/", "%",
    "^"
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
    if(tokens[0]?.type == TokenType.Import) {
        tokens.shift()
        const imports = parseList()
        return {kind: "Import", imports: imports} as Import
    }
    if(tokens[0]?.type == TokenType.Break) {
        tokens.shift()
        return {kind: "Break"} as Break
    }
    if(tokens[0]?.type == TokenType.Logic) {
        return {kind: "Logic", type: tokens.shift().value, condition: parseExpression(), body: parseBody()} as Logic
    } else if(tokens[0]?.type == TokenType.Function) {
        tokens.shift()
        let functionStatement = {kind: "Function", symbol: tokens.shift().value, arguments: parseList(), return: parseExpression(), body: {}} as FunctionDeclaration
        functionStatement.body = parseBody()
        return functionStatement
    } else if(tokens[0].type == TokenType.Constant && tokens[2].type == TokenType.OpenParenthesis) {
        return parseReferenceExpression()
    } else if(tokens[0].type == TokenType.Constant && tokens[2].type == TokenType.Assignment) {
        return parseAssignment()
    } else {
        const left = parseMemberExpression()
        if(left?.kind == "FunctionCall") {
            return left
        }
        if(tokens[0].type == TokenType.Assignment) {
            return parseAssignment(left)
        } else {
            console.log("Unexpected token found while parsing statement   " + tokens.shift()?.value)
            return null
        }
    }
}
function parseAssignment(identifier?: Expression): Statement {
    let constant: boolean = false
    if(tokens[0]?.type == TokenType.Constant) {
        constant = true
        tokens.shift()
    }
    if(identifier == undefined) {
        identifier = parseMemberExpression()
    }
    tokens.shift()
    return {kind: "Assignment", constant, identifier, value: parseExpression()} as Assignment
}
function parseExpression(minPrecedence = 0): Expression {
    if(tokens[0]?.value == "-" && tokens[0]?.type == TokenType.BinaryOperator) {
        tokens.shift()
        return {kind: "NumericLiteral", value: -parseFloat(tokens.shift().value)} as NumericLiteral
    }
    let left = parseMemberExpression()
    while (tokens[0]?.type == TokenType.BinaryOperator && precedence.indexOf(tokens[0].value) >= minPrecedence) {
        const operation = tokens.shift().value
        const currentPrecedence = precedence.indexOf(operation)
        let right = parseExpression(currentPrecedence + 1)
        left = {
            kind: "BinaryExpression",
            left,
            operation,
            right
        } as BinaryExpression
    }
    return left
}
function parseMemberExpression(): Expression {
    if(tokens[0]?.type == TokenType.Identifier) {
        if(tokens[1]?.type == TokenType.Dot) {
            let object = {
                kind: "MemberExpression",
                object: tokens.shift().value,
            } as MemberExpression
            let current = object
            // @ts-ignore
            while (tokens[0]?.type == TokenType.Dot) {
                tokens.shift()
                if(tokens[1]?.type == TokenType.Dot) {
                    current.property = {
                        kind: "MemberExpression",
                        object: tokens[0].value,
                        property: parseReferenceExpression()
                    } as MemberExpression
                } else {
                    current.property = parseReferenceExpression()
                }
                current = current.property as MemberExpression
            }
            return object
        }
        return parseReferenceExpression()
    }
    return parsePrimaryExpression()
}
function parseReferenceExpression(): Expression {
    if(tokens[0]?.type == TokenType.Constant && tokens[2]?.type == TokenType.OpenParenthesis) {
        tokens.shift()
        const reference = {kind: "FunctionCall", constant: true, referencing: {kind: "Identifier", symbol: tokens.shift().value}, arguments: parseList()} as FunctionCall
        tokens.shift()
        tokens.shift()
        return reference
    } else if(tokens[1]?.type == TokenType.OpenParenthesis) {
        const reference = {kind: "FunctionCall", constant: false, referencing: {kind: "Identifier", symbol: tokens.shift().value}, arguments: parseList()} as FunctionCall
        tokens.shift()
        tokens.shift()
        return reference
    } else {
        let index = undefined
        let symbol = tokens.shift().value
        if(tokens[0]?.type == TokenType.OpenSquareBracket) {
            index = parseList()
        }
        return {kind: "Identifier", symbol, index} as Identifier
    }
}
function parsePrimaryExpression(): Expression {
    switch (tokens[0]?.type) {
        case TokenType.String:
            return {kind: "StringLiteral", value: tokens.shift().value} as StringLiteral
        case TokenType.Number:
            return {kind: "NumericLiteral", value: parseFloat(tokens.shift().value)} as NumericLiteral
        case TokenType.Boolean:
            return {kind: "BooleanLiteral", value: tokens.shift().value == "true"} as BooleanLiteral
        case TokenType.Null:
            tokens.shift()
            return {kind: "NullLiteral", value: null} as NullLiteral
        case TokenType.OpenSquareBracket:
            return {kind: "ArrayLiteral", elements: parseList()} as ArrayLiteral
        case TokenType.Object:
            tokens.shift()
            tokens.shift()
            const properties: Statement[] = []
            while (true) {
                properties.push(parseAssignment())
                // @ts-ignore
                if (tokens[0]?.type == TokenType.Comma) {
                    tokens.shift()
                } else {
                    tokens.shift()
                    break
                }
            }
            return {kind: "ObjectLiteral", properties} as ObjectLiteral
        case TokenType.OpenParenthesis:
            tokens.shift()
            const expression = parseExpression()
            tokens.shift()
            return expression
        default:
            console.log("Unexpected token found while parsing expression   " + tokens.shift()?.value)
            return null
    }
}
function parseBody(): Statement[] {
    tokens.shift()
    const body: Statement[] = []

    while (tokens[0]?.type != TokenType.ClosedCurlyBracket) {
        body.push(parseStatement())
    }
    tokens.shift()
    return body
}
function parseList(): Expression[] {
    tokens.shift()
    const elements: Expression[] = []
    while (true) {
        elements.push(parseExpression())
        if (tokens[0]?.type == TokenType.Comma) {
            tokens.shift()
        } else {
            break
        }
    }
    tokens.shift()
    return elements
}