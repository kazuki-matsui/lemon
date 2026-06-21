export type NodeType =
    | "Program"
    | "Import"
    | "Module"
    | "Assignment"
    | "Mutation"
    | "Logic"
    | "Break"
    | "Function"


    | "LogicalExpression"
    | "ConditionalExpression"
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



export interface ImportStatement extends Statement {
    kind: "Import"
    imports: Array<string>
}
export interface ModuleStatement extends Statement {
    kind: "Module"
    symbol: string
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
    identifier: Identifier
    value: Expression
}
export interface Logic extends Statement {
    kind: "Logic"
    type: "check" | "repeat" | "while"
    parameters: Expression
    body: Statement[]
}
export interface Function extends Statement {
    kind: "Function"
    symbol: string
    parameters: Array<Identifier>
    return: Expression
    body: Statement[]
}
export interface Break extends Statement {
    kind: "Break"
}



export interface LogicalExpression extends Expression {
    kind: "LogicalExpression"
    left: Expression
    operation: "&" | "|"
    right: Expression
}
export interface ConditionalExpression extends Expression {
    kind: "ConditionalExpression"
    left: Expression
    operation: "=" | "<" | ">" | "!="
    right: Expression
}
export interface BinaryExpression extends Expression {
    kind: "BinaryExpression"
    left: Expression
    operation: "+" | "-" | "*" | "/" | "%" | "^" | "√"
    right: Expression
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
    referencing: Identifier
    parameters: Array<Expression>
}
export interface IndexReference extends Expression {
    kind: "IndexReference"
    referencing: Identifier
    index: Expression
}
export interface MemberReference extends Expression {
    kind: "MemberReference"
    referencing: Identifier
    property: Identifier | FunctionReference | MemberReference
}
export interface ObjectLiteral extends Expression {
    kind: "ObjectLiteral"
    body: Statement[]
}
export interface ArrayLiteral extends Expression {
    kind: "ArrayLiteral"
    value: Array<Expression>
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