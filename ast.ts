export type NodeType =
    | "Program"
    | "Import"
    | "Module"
    | "Assignment"
    | "Mutation"
    | "Logic"
    | "Break"
    | "Function"

    | "Identifier"
    | "Reference"
    | "FunctionReference"
    | "StringLiteral"
    | "NumericLiteral"
    | "BooleanLiteral"
    | "NullLiteral"
    | "ArrayLiteral"
    | "ObjectLiteral"
    | "BinaryExpression"
    | "ConditionalExpression"
    | "LogicalExpression"

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
    imports: Array<string>
}
export interface Module extends Statement {
    kind: "Module"
    symbol: Identifier
    body: Statement[] | FunctionReference[]
}
export interface Assignment extends Statement {
    kind: "Assignment"
    constant: boolean
    identifier: Identifier
    value: Expression
}
export interface Mutation extends Statement {
    kind: "Mutation"
    reference: Reference
    value: Expression
}
export interface Logic extends Statement {
    kind: "Logic"
    type: "Check" | "Repeat" | "While"
    parameters: Expression[]
    body: Statement[] | FunctionReference[]
}
export interface Function extends Statement {
    kind: "Function"
    symbol: string
    parameters: Array<Expression>
    return: Expression
    body: Statement[] | FunctionReference[]
}
export interface Break extends Statement {
    kind: "Break"
}



export interface Identifier extends Expression {
    kind: "Identifier"
    symbol: string
}
export interface Reference extends Expression {
    kind: "Reference"
    referencing: Identifier
}
export interface FunctionReference extends Expression {
    kind: "FunctionReference"
    referencing: Function
    parameters: Array<Expression>
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
export interface ArrayLiteral extends Expression {
    kind: "ArrayLiteral"
    value: Array<any>
}
export interface ObjectLiteral extends Expression {
    kind: "ObjectLiteral"
    body: Statement[] | FunctionReference[]
}
export interface BinaryExpression extends Expression {
    kind: "BinaryExpression"
    left: Expression
    right: Expression
    operation: "+" | "-" | "%" | "/" | "*" | "^" | "√"
}
export interface ConditionalExpression extends Expression {
    kind: "ConditionalExpression"
    left: Expression
    right: Expression
    operation: "=" | "<" | ">" | "!="
}
export interface LogicalExpression extends Expression {
    kind: "LogicalExpression"
    left: Expression
    right: Expression
    operation: "&" | "|"
}