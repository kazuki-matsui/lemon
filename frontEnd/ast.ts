export type NodeType =
    | "Program"
    | "Assignment"
    | "Mutation"
    | "Logic"
    | "Break"
    | "Function"


    | "BinaryExpression"
    | "Identifier"
    | "Reference"
    | "FunctionReference"
    | "IndexReference"
    | "MemberReference"
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



export interface Assignment extends Statement {
    kind: "Assignment"
    constant: boolean
    identifier: Identifier
    value: Expression
}
export interface Mutation extends Statement {
    kind: "Mutation"
    referencing: Reference
    value: Expression
}
export interface Logic extends Statement {
    kind: "Logic"
    type: string
    parameters: Expression
    body: Statement[]
}
export interface Function extends Statement {
    kind: "Function"
    symbol: string
    parameters: Expression[]
    return: Expression
    body: Statement[]
}
export interface Break extends Statement {
    kind: "Break"
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
}
export interface Reference extends Expression {
    kind: "Reference"
    symbol: string
    index?: Expression
}
export interface FunctionReference extends Expression {
    kind: "FunctionReference"
    constant: boolean
    referencing: Identifier
    parameters: Expression[]
}
export interface MemberReference extends Expression {
    kind: "MemberReference"
    referencing: Reference | FunctionReference
    property?: MemberReference
}
export interface ObjectLiteral extends Expression {
    kind: "ObjectLiteral"
    body: Statement[]
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
}