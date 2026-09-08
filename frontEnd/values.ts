import {Statement} from "./ast";

export type ValueType =
    | "function"
    | "object"
    | "array"
    | "string"
    | "number"
    | "boolean"
    | "null"
export interface RuntimeValue {
    type: ValueType
    properties?: Map<string, RuntimeValue>
    elements?: Map<number, RuntimeValue>
    value?: any
}

export interface FunctionValue {
    type: "function"
    arguments: string[]
    return: string
    body: Statement[]
}
export interface ObjectValue {
    type: "object"
    properties: Map<string, RuntimeValue>
}
export interface ArrayValue {
    type: "array"
    elements: Map<number, RuntimeValue>
}
export interface StringValue {
    type: "string"
    value: string
}
export interface NumberValue {
    type: "number"
    value: number
}
export interface BooleanValue {
    type: "boolean"
    value: boolean
}
export interface NullValue {
    type: "null"
    value: null
}