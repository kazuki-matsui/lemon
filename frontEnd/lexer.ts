export enum TokenType {
    OpenParenthesis, ClosedParenthesis,
    Assignment, Mutation,
    BinaryOperator,
    Dot, Comma, Minus,
    Constant,
    OpenSquareBracket, ClosedSquareBracket,
    OpenCurlyBracket, ClosedCurlyBracket,
    String, Number, Boolean, Null,
    Break, Logic, Function,
    Identifier, Reference,
    EndOfFile
}
export interface Token {
    value: string,
    type: TokenType
}

function token(value: string, type: TokenType): Token {
    return {value, type}
}
function isNumber(source: string) {
    const number = source?.charCodeAt(0)
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)]
    return number >= bounds[0] && number <= bounds[1]
}
function isAlphabetical(source: string) {
    return source.toUpperCase() != source.toLowerCase()
}
function lastTokenTypeOf(tokens: Array<Token>, type: TokenType) {
    for(let i = tokens.length - 1; i >= 0; i--) {
        if(tokens[i].type === type) {
            return i
        }
    }
    return -1
}
function isIdentified(tokens: Array<Token>, source: string): boolean {
    for(const token of tokens) {
        if(token.type === TokenType.Identifier && token.value == source) {
            return true
        }
    }
    return false
}

export default function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>()
    const source = sourceCode.split("")
    while(source.length > 0) {
        if(source[0] == "(") {
            tokens.push(token(source.shift(), TokenType.OpenParenthesis))
        } else if(source[0] == ")") {
            tokens.push(token(source.shift(), TokenType.ClosedParenthesis))
        } else if(source[0] == "=" && lastTokenTypeOf(tokens, TokenType.OpenParenthesis) <= lastTokenTypeOf(tokens, TokenType.ClosedParenthesis)) {
            tokens.push(token(source.shift(), TokenType.Assignment))
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
        } else if(source[0] == ".") {
            tokens.push(token(source.shift(), TokenType.Dot))
        } else if(source[0] == ",") {
            tokens.push(token(source.shift(), TokenType.Comma))
        } else if(source[0] == "-" && isNumber(source[1])) {
            tokens.push(token(source.shift(), TokenType.Minus))
        } else if(source[0] == "&" || source[0] == "|" || source[0] == ":" || source[0] == "=" || source[0] == ">" || source[0] == "<" || source[0] == "+" || source[0] == "-" || source[0] == "*" || source[0] == "/" || source[0] == "%" || source[0] == "^" || source[0] == "√") {
            tokens.push(token(source.shift(), TokenType.BinaryOperator))
        } else if(source[0] == "!" && source[1] == "=") {
            tokens.push(token(source.shift() + source.shift(), TokenType.BinaryOperator))
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
        } else {
            if(source[0] == "'" || source[0] == '"') {
                let markdown = source.shift()
                let string = ""
                while(source.length > 0) {
                    if(source[0] == markdown) {
                        source.shift()
                        break
                    }
                    string += source.shift()
                }
                tokens.push(token(string, TokenType.String))
            }

            else if(isNumber(source[0])) {
                let number = ""
                while(source.length > 0 && (isNumber(source[0]) || source[0] == ".")) {
                    if(number.includes(".") && source[0] == ".") {
                        break
                    }
                    number += source.shift()
                }
                tokens.push(token(number, TokenType.Number))
            }

            else if (isAlphabetical(source[0])) {
                let alphabeticalCharacter = ""
                while(source.length > 0 && (isAlphabetical(source[0]) || isNumber(source[0]))) {
                    alphabeticalCharacter += source.shift()
                }

                if(alphabeticalCharacter == "true" || alphabeticalCharacter == "false") {
                    tokens.push(token(alphabeticalCharacter, TokenType.Boolean))
                } else if(alphabeticalCharacter == "null") {
                    tokens.push(token(alphabeticalCharacter, TokenType.Null))
                } else if(alphabeticalCharacter == "break") {
                    tokens.push(token(alphabeticalCharacter, TokenType.Break))
                } else if((alphabeticalCharacter == "check" || alphabeticalCharacter == "otherwise" || alphabeticalCharacter == "every" || alphabeticalCharacter == "repeat" || alphabeticalCharacter == "while")) {
                    tokens.push(token(alphabeticalCharacter, TokenType.Logic))
                } else if(alphabeticalCharacter == "function") {
                    tokens.push(token(alphabeticalCharacter, TokenType.Function))
                } else {
                    if(source[1] == "=" || tokens[tokens.length - 1]?.type == TokenType.Function || lastTokenTypeOf(tokens, TokenType.Function) > lastTokenTypeOf(tokens, TokenType.ClosedSquareBracket) || tokens[tokens.length - 2]?.value == "repeat" && source[1] == ":")  {
                        tokens.push(token(alphabeticalCharacter, TokenType.Identifier))
                    } else if(isIdentified(tokens, alphabeticalCharacter) || source[0] == "." || source[0] == "[" || tokens[tokens.length - 1]?.type == TokenType.OpenParenthesis) {
                        tokens.push(token(alphabeticalCharacter, TokenType.Reference))
                    }
                }
            }

            else if(source[0] == " " || source[0] == "\n" || source[0] == "\t") {
                source.shift()
            } else {
                console.log("No Token Available: " + source[0])
                tokens.shift()
            }
        }
    }
    tokens.push(token("EndOfFile", TokenType.EndOfFile))
    return tokens
}