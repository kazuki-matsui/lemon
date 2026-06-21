import {
    ArrayLiteral,
    Assignment,
    BinaryExpression,
    BooleanLiteral,
    Break,
    ConditionalExpression,
    Expression,
    Function,
    FunctionReference,
    Identifier,
    ImportStatement,
    Logic,
    LogicalExpression,
    ModuleStatement,
    Mutation,
    NullLiteral,
    NumericLiteral,
    Program,
    Reference,
    Statement,
    StringLiteral
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
    if(tokens[0].type == TokenType.Import) {
        return parseImport()
    } else if(tokens[1].type == TokenType.Assignment) {
        return parseModule()
    }
}
function parseImport(): Statement {
    let imports = []
    while(true) {
        if(tokens[0].type == TokenType.ClosedSquareBracket) {
            tokens.shift()
            break
        }
        if(tokens[0].type === TokenType.String) {
            imports.push(tokens[0].value)
        }
    }
    return {kind: "Import", imports} as ImportStatement
}
function parseModule(): Statement {
    let module = {kind: "Module", symbol: tokens.shift().value, body: []} as ModuleStatement
    tokens.shift()
    tokens.shift()
    let openCurlyBracket = 1
    let closedCurlyBracket = 0
    while(true) {
        tokens[0].type == TokenType.OpenCurlyBracket ? openCurlyBracket ++ : openCurlyBracket
        tokens[0].type == TokenType.ClosedCurlyBracket ? closedCurlyBracket ++ : closedCurlyBracket
        if(openCurlyBracket == closedCurlyBracket) {
            tokens.shift()
            break
        }
        module.body.push(parsePrimaryStatement())
    }
    return module as ModuleStatement
}
function parsePrimaryStatement(): Statement {
    if(tokens[1].type == TokenType.Constant || tokens[1].type == TokenType.Assignment) {
        return parseAssignment(tokens[1].type == TokenType.Constant)
    } else if(tokens[1].type == TokenType.Mutation) {
        return parseMutation()
    } else if(tokens[0].type == TokenType.Logic) {
        return parseLogic()
    } else if(tokens[0].type == TokenType.Function) {
        return parseFunction()
    }
}
function parseAssignment(constant: boolean): Statement {
    if(constant == true) {
        tokens.shift()
    }
    const identifier = parsePrimaryExpression()
    tokens.shift()
    return {kind: "Assignment", constant, identifier, value: parseLogicalExpression()} as Assignment
}
function parseMutation(): Statement {
    const identifier = parsePrimaryExpression()
    tokens.shift()
    return {kind: "Mutation", identifier, value: parseLogicalExpression()} as Mutation
}
function parseLogic(): Statement {
    const type = tokens.shift().value
    tokens.shift()
    const parameters = parseLogicalExpression()
    tokens.shift()
    tokens.shift()
    tokens.shift()
    let logic = {kind: "Logic", type, parameters, body: []} as Logic
    let openCurlyBracket = 1
    let closedCurlyBracket = 0
    while(true) {
        tokens[0].type == TokenType.OpenCurlyBracket ? openCurlyBracket ++ : openCurlyBracket
        tokens[0].type == TokenType.ClosedCurlyBracket ? closedCurlyBracket ++ : closedCurlyBracket
        if(openCurlyBracket == closedCurlyBracket) {
            tokens.shift()
            break
        }
        logic.body.push(parsePrimaryStatement())
    }
    return logic
}
function parseFunction(): Statement {
    tokens.shift()
    let functionS = {kind: "Function", symbol: tokens.shift().value, parameters: [], return: {}, body: []} as Function
    while(true) {
        if(tokens[0].type == TokenType.ClosedSquareBracket) {
            tokens.shift()
            break
        } else if(tokens[0].type === TokenType.Identifier) {
            functionS.parameters.push({kind: "Identifier", symbol: tokens[0].value})
        }
        tokens.shift()
    }
    tokens.shift()
    functionS.return = parseLogicalExpression()
    tokens.shift()
    tokens.shift()
    tokens.shift()
    let openCurlyBracket = 1
    let closedCurlyBracket = 0
    while(true) {
        // @ts-ignore
        tokens[0].type == TokenType.OpenCurlyBracket ? openCurlyBracket ++ : openCurlyBracket
        // @ts-ignore
        tokens[0].type == TokenType.ClosedCurlyBracket ? closedCurlyBracket ++ : closedCurlyBracket
        if(openCurlyBracket == closedCurlyBracket) {
            tokens.shift()
            break
        }
        functionS.body.push(parsePrimaryStatement())
    }
    return functionS
}





function parseLogicalExpression(): Expression {
    let left = parseConditionalExpression()
    while(tokens[0].value == "&") {
        tokens.shift().value
        const right = parseConditionalExpression()
        left = {
            kind: "LogicalExpression",
            left,
            operation: "&",
            right
        } as LogicalExpression
    }
    while(tokens[0].value == "|") {
        tokens.shift().value
        const right = parseConditionalExpression()
        left = {
            kind: "LogicalExpression",
            left,
            operation: "|",
            right
        } as LogicalExpression
    }
    return left
}
function parseLogicalOrExpression(): Expression {
    let left = parseConditionalExpression()
    while(tokens[0].value == "|") {
        tokens.shift().value
        const right = parseConditionalExpression()
        left = {
            kind: "LogicalExpression",
            left,
            operation: "|",
            right
        } as LogicalExpression
    }
    return left
}
function parseConditionalExpression(): Expression {
    let left = parseAdditionalExpression()
    while(tokens[0].type == TokenType.ConditionalOperator && (tokens[0].value == ">" || tokens[0].value == "<" || tokens[0].value == "=" || tokens[0].value == "!=")) {
        const operation = tokens.shift().value
        const right = parseAdditionalExpression()
        left = {
            kind: "ConditionalExpression",
            left,
            operation,
            right
        } as ConditionalExpression
    }
    return left
}
function parseAdditionalExpression(): Expression {
    let left = parseMultiplicativeExpression()
    while(tokens[0].type == TokenType.BinaryOperator && (tokens[0].value == "+" || tokens[0].value == "-")) {
        const operation = tokens.shift().value
        const right = parseMultiplicativeExpression()
        left = {
            kind: "BinaryExpression",
            left,
            operation,
            right
        } as BinaryExpression
    }
    return left
}
function parseMultiplicativeExpression(): Expression {
    let left = parseExponentialExpression()
    while(tokens[0].value == "*" || tokens[0].value == "/" || tokens[0].value == "%") {
        const operation = tokens.shift().value
        const right = parseExponentialExpression()
        left = {
            kind: "BinaryExpression",
            left,
            operation,
            right
        } as BinaryExpression
    }
    return left
}

function parseExponentialExpression(): Expression {
    let left = parsePrimaryExpression()
    while(tokens[0].value == "^" || tokens[0].value == "√") {
        const operation = tokens.shift().value
        const right = parsePrimaryExpression()
        left = {
            kind: "BinaryExpression",
            left,
            operation,
            right
        } as BinaryExpression
    }
    return left
}
/*function parseReference(): Expression {
    if(tokens[0].type == TokenType.Reference) {
        if(tokens[1].type == TokenType.OpenSquareBracket) {
            if(true) {
                return {kind: "Reference", referencing: {kind: "Identifier", symbol: tokens.shift().value}} as IndexReference
            } else {
                if(tokens[0].type == TokenType.Reference && tokens[1].type == TokenType.OpenSquareBracket) {
                    let reference = {kind: "FunctionReference", referencing: {kind: "Identifier", symbol: tokens.shift().value}, parameters: []} as FunctionReference
                    tokens.shift()
                    let parameter = {} as Expression
                    while(true) {
                    // @ts-ignore
                    if(tokens[0].type == TokenType.ClosedSquareBracket) {
                        tokens.shift()
                        break
                    } else {
                        parameter = parseExpression()
                        if(parameter != undefined){
                            reference.parameters.push(parameter)
                        }
                    }
                }
                tokens.shift()
                tokens.shift()
                return reference
                }
                return {kind: "Reference", referencing: {kind: "Identifier", symbol: tokens.shift().value}} as FunctionReference
            }
        } else if(tokens[1].value.includes(".")) {
            return {kind: "Reference", referencing: {kind: "Identifier", symbol: tokens.shift().value}} as MemberReference
        } else {
            return {kind: "Reference", referencing: {kind: "Identifier", symbol: tokens.shift().value}} as Reference
        }
    } else {
        parsePrimaryExpression()
    }
} */
function parsePrimaryExpression(): Expression {
    switch (tokens[0].type) {
        case TokenType.Break:
            tokens.shift()
            return {kind: "Break"} as Break
        case TokenType.Identifier:
            return {kind: "Identifier", symbol: tokens.shift().value} as Identifier
        case TokenType.String:
            return {kind: "StringLiteral", value: tokens.shift().value} as StringLiteral
        case TokenType.Number:
            return {kind: "NumericLiteral", value: parseFloat(tokens.shift().value)} as NumericLiteral
        case TokenType.Boolean:
            return {kind: "BooleanLiteral", value: tokens.shift().value == "true"} as BooleanLiteral
        case TokenType.Null:
            tokens.shift()
            return {kind: "NullLiteral"} as NullLiteral
        default:
            console.error("Unexpected token found during parsing", tokens.shift())
    }
}