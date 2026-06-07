import fs from 'fs';
const file = fs.readFileSync("grapefruit.lemon", "utf8")
export enum TokenType {
    OpenParenthesis, ClosedParenthesis,
    Assigment, Mutation,
    ConditionalOperator,
    AlgebraicOperator,
    Constant,
    OpenSquareBracket, ClosedSquareBracket,
    OpenCurlyBracket, ClosedCurlyBracket,
    Comma, Period,
    String,
    Hexadecimal, Number, AlphabeticalCharacter,
    Import
}
export interface Token {
    value: string,
    type: TokenType
}

function token(value: string, type: TokenType): Token {
    return {value, type}
}
function isAlphabetical(source: string) {
    return source.toUpperCase() != source.toLowerCase()
}
function isNumber(source: string) {
    const c = source.charCodeAt(0)
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)]
    return (c >= bounds[0] && c <= bounds[1])
}
function latestTokenType(tokens: any, type: TokenType) {
    for(let i = tokens.length - 1; i >= 0; i--) {
        if(tokens[i].type === type) {
            return i
        }
    }
}

export function tokenize(data: string): Token[] {
    const tokens = new Array<Token>()
    const source = data.split("")
    while(source.length > 0) {
        if(source[0] == "(") {
            tokens.push(token(source.shift(), TokenType.OpenParenthesis))
        } else if(source[0] == ")") {
            tokens.push(token(source.shift(), TokenType.ClosedParenthesis))
        } else if(source[0] == "=" && (latestTokenType(tokens, TokenType.OpenParenthesis) < latestTokenType(tokens, TokenType.ClosedParenthesis) || latestTokenType(tokens, TokenType.OpenParenthesis) == undefined)) {
            tokens.push(token(source.shift(), TokenType.Assigment))
        } else if(source[0] == "-" && source[1] == ">") {
            tokens.push(token(source.shift() + source.shift(), TokenType.Mutation))
        } else if(source[0] == "/" && source[1] == "*") {
            let comment = source.shift() + source.shift()
            while(source.length > 0) {
                // @ts-ignore
                if(source[0] == "*" && source[1] == "/") {
                    comment += source.shift() + source.shift()
                    break
                }
                comment += source.shift()
            }
        } else if(source[0] == "/" && source[1] == "/") {
            let comment = source.shift() + source.shift()
            while(source.length > 0) {
                // @ts-ignore
                if(source[0] == "\n") {
                    break
                }
                comment += source.shift()
            }
        } else if((source[0] == "!" && source[1] == "=") || source[0] == "=" || source[0] == "<" || source[0] == ">" || source[0] == "&" || source[0] == "|") {
            if(source[0] == "!" && source[1] == "=") {
                tokens.push(token(source.shift() + source.shift(), TokenType.ConditionalOperator))
            } else {
                tokens.push(token(source.shift(), TokenType.ConditionalOperator))
            }
        } else if(source[0] == "+" || source[0] == "-" || source[0] == "%" || source[0] == "/" || source[0] == "*" || source[0] == "^" || source[0] == "√") {
            tokens.push(token(source.shift(), TokenType.AlgebraicOperator))
        } else if(source[0] == "!") {
            tokens.push(token(source.shift(), TokenType.Constant))
        } else if(source[0] == "[") {
            tokens.push(token(source.shift(), TokenType.OpenSquareBracket))
        } else if(source[0] == "]") {
            tokens.push(token(source.shift(), TokenType.ClosedSquareBracket))
        } else if(source[0] == "{") {
            tokens.push(token(source.shift(), TokenType.OpenCurlyBracket))
        } else if(source[0] == "}") {
            tokens.push(token(source.shift(), TokenType.ClosedCurlyBracket))
        } else if(source[0] == ",") {
            tokens.push(token(source.shift(), TokenType.Comma))
        } else if(source[0] == ".") {
            tokens.push(token(source.shift(), TokenType.Period))
        } else {
            if(source[0] == "'" || source[0] == '"') {
                let markdown = source.shift()
                let string = markdown
                while(source.length > 0) {
                    if(source[0] == markdown) {
                        string += source.shift()
                        break
                    }
                    string += source.shift()
                }
                tokens.push(token(string, TokenType.String))
            } else if(source[0] == "0" && source[1] == "x") {
                let hexadecimal = ""
                while(source.length > 0 && (isAlphabetical(source[0]) || isNumber(source[0]))) {
                    hexadecimal += source.shift()
                }
                tokens.push(token(hexadecimal, TokenType.Hexadecimal))
            } else if(isNumber(source[0])) {
                let number = ""
                while(source.length > 0 && isNumber(source[0])) {
                    number += source.shift()
                }
                tokens.push(token(number, TokenType.Number))
            } else if(isAlphabetical(source[0])) {
                let alphabeticalCharacter = ""
                while(source.length > 0 && isAlphabetical(source[0])) {
                    alphabeticalCharacter += source.shift()
                }
                if(alphabeticalCharacter == "import" && tokens.length == 0) {
                    tokens.push(token(alphabeticalCharacter, TokenType.Import))
                } else {
                    tokens.push(token(alphabeticalCharacter, TokenType.AlphabeticalCharacter))
                }
            } else if(source[0] == " " || source[0] == "\n" || source[0] == "\t") {
                source.shift()
            } else {
                console.log("Unrecognized Character: " + source[0])
                source.shift()
            }
        }
    }
    return tokens
}

for(const token of tokenize(file)) {
    console.log(token)
}