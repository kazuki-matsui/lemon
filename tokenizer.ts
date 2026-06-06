export enum TokenType {
    ConstantToken,
    InitializerToken,
    MutatingToken,
    IdentifierToken,
    EqualsToken,
}

export interface Token {
    value: string,
    type: TokenType
}

function tokenize(file) {
}