export type NodeType =
    | "Program"
    | "Import"
    | "Assignment"
    | "Logic"
    | "Break"
    | "Function"


    | "BinaryExpression"
    | "Identifier"
    | "FunctionCall"
    | "MemberExpression"
    | "ObjectLiteral"
    | "ArrayLiteral"
    | "StringLiteral"
    | "NumericLiteral"
    | "BooleanLiteral"
    | "NullLiteral"

export interface Statement {
    kind: NodeType
}
export interface Expression extends Statement {
}
export interface Program extends Statement {
    kind: "Program"
    body: Statement[]
}


export interface Import extends Statement {
    kind: "Import"
    imports: Expression[]
}
export interface Assignment extends Statement {
    kind: "Assignment"
    constant: boolean
    identifier: Identifier
    value: Expression
}
export interface Logic extends Statement {
    kind: "Logic"
    type: string
    condition: Expression
    body: Statement[]
}
export interface Break extends Statement {
    kind: "Break"
}
export interface FunctionDeclaration extends Statement {
    kind: "Function"
    symbol: string
    arguments: Identifier[]
    return: Identifier
    body: Statement[]
}






export interface BinaryExpression extends Expression {
    kind: "BinaryExpression"
    left: Expression
    operation: string
    right: Expression
}
export interface Identifier extends Expression {
    kind: "Identifier"
    symbol: string
    index?: Expression
}
export interface FunctionCall extends Expression {
    kind: "FunctionCall"
    constant: boolean
    referencing: Identifier
    arguments: Expression[]
}
export interface MemberExpression extends Expression {
    kind: "MemberExpression"
    object?: string
    property: Expression
}
export interface ObjectLiteral extends Expression {
    kind: "ObjectLiteral"
    properties: Statement[]
}
export interface ArrayLiteral extends Expression {
    kind: "ArrayLiteral"
    elements: Expression[]
}
export interface StringLiteral extends Expression {
    kind: "StringLiteral"
    value: string
}
export interface NumericLiteral extends Expression {
    kind: "NumericLiteral"
    value: number
}
export interface BooleanLiteral extends Expression {
    kind: "BooleanLiteral"
    value: boolean
}
export interface NullLiteral extends Expression {
    kind: "NullLiteral"
    value: null
}