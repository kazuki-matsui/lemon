import {
    ArrayLiteral,
    Assignment,
    BinaryExpression,
    BooleanLiteral, FunctionDeclaration,
    Identifier, Import, Logic, MemberExpression,
    NumericLiteral, ObjectLiteral,
    Statement,
    StringLiteral
} from "./ast";
import {
    ArrayValue,
    BooleanValue,
    FunctionValue,
    NullValue,
    NumberValue,
    ObjectValue,
    RuntimeValue,
    StringValue
} from "./values";
import parse from "./parser";
import Environment from "./environment";
import fs from "fs";

class BreakStatement {}

export default function evaluate(sourceCode: string) {
    const program = parse(sourceCode)
    const environment = new Environment
    for(const statement of program.body) {
        evaluateNode(statement, environment)
    }
    return environment
}
export function evaluateNode(node: Statement, environment: Environment): RuntimeValue {
    let ifStatement: boolean
    switch (node.kind) {
        case "Import":
            const imports = (<Import>node).imports;
            for (const importedFile of imports) {
                const parsedFile = evaluate(fs.readFileSync((<StringLiteral>importedFile).value, "utf8"))
                for (const variable of parsedFile.getVariables()) {
                    if (environment.hasConstant(variable[0])) {
                        throw new Error("Constant '" + variable[0] + "' cannot be reassigned.")
                    }
                    if (parsedFile.hasConstant(variable[0])) {
                        environment.assign(variable[0], variable[1], true, environment)
                    }
                    environment.assign(variable[0], variable[1], false, environment)
                }
            }
            return null;
        case "Assignment": {
            const assignment = node as Assignment
            const symbol = assignment.identifier.symbol
            const value = evaluateNode(assignment.value, environment)
            if (environment.hasConstant(symbol)) {
                throw new Error("Constant '" + symbol + "' cannot be reassigned.")
            }
            if (assignment.identifier.index == undefined) {
                if (assignment.constant && !environment.hasVariable(symbol)) {
                    environment.assign(symbol, value, true, environment)
                } else if (!assignment.constant) {
                    environment.assign(symbol, value, false, environment)
                }
            }
            const index = evaluateNode(assignment.identifier.index, environment).value
            const variable = environment.getVariable(symbol)
            variable.value[index] = value
            environment.assign(symbol, variable, false, environment)
            return null
        }
        case "Logic": {
            const logic = node as Logic
            switch (logic.type) {
                case "if": {
                    if(evaluateNode(logic.condition, environment).value) {
                        ifStatement = true
                        for(const statement of logic.body) {
                            evaluateNode(statement, environment)
                        }
                    }
                    ifStatement = false
                    break;
                }
                case "otherwise": {
                    if(evaluateNode(logic.condition, environment).value && ifStatement == false) {
                        ifStatement = true
                        for(const statement of logic.body) {
                            evaluateNode(statement, environment)
                        }
                    }
                    ifStatement = false
                    break;
                }
                case "repeat": {
                    const repeatNumber = evaluateNode(logic.condition, environment).value
                    for (let i = 1 ; i <= repeatNumber; i += 1) {
                        try {
                            for(const statement of logic.body) {
                                evaluateNode(statement, environment)
                            }
                        } catch (Break) {
                            if(Break instanceof BreakStatement) {
                                break
                            }
                        }
                    }
                    break
                }
                case "while": {
                    while(evaluateNode(logic.condition, environment).value) {
                        try {
                            for(const statement of logic.body) {
                                evaluateNode(statement, environment)
                            }
                        } catch (Break) {
                            if(Break instanceof BreakStatement) {
                                break
                            }
                        }
                    }
                    break
                }
            }
            return null
        }
        case "Break": {
            throw new BreakStatement()
        }
        case "Function":
            const func = node as FunctionDeclaration
            const variable = {
                type: "function",
                arguments: [],
                return: func.return.symbol,
                body: func.body
            } as FunctionValue
            for(const argument of func.arguments) {
                variable.arguments.push(argument.symbol)
            }
            environment.assign(func.symbol, variable, false, environment)
            return null
        case "Identifier": {
            const identifier = node as Identifier
            if (identifier?.index == undefined) {
                return environment.getVariable(identifier.symbol)
            } else {
                const index = evaluateNode(identifier.index, environment).value
                return environment.getVariable(identifier.symbol).value[index]
            }
        }
        case "BinaryExpression":
            return evaluateBinaryExpression(node as BinaryExpression, environment)
        case "FunctionCall":

        case "MemberExpression": {
            let current = node as MemberExpression
            let currentMap = environment.getVariable(current.object).properties
            while (true) {
                if (current.property.kind == "Identifier") {
                    return currentMap.get((<Identifier>current.property).symbol)
                } else {
                    current = current.property as MemberExpression
                    currentMap = currentMap.get(current.object).properties
                }
            }
        }
        case "ObjectLiteral": {
            const properties = (<ObjectLiteral>node).properties
            const propertiesMap = new Map<string, RuntimeValue>
            for (const property of properties) {
                const assignment = property as Assignment
                propertiesMap.set(assignment.identifier.symbol, evaluateNode(assignment.value, environment))
            }
            return {type: "object", properties: propertiesMap} as ObjectValue
        }
        case "ArrayLiteral": {
            const elements = (<ArrayLiteral>node).elements
            const elementsMap = new Map<number, RuntimeValue>
            let index: number = 0
            for (const element of elements) {
                index++
                elementsMap.set(index, evaluateNode(element, environment))
            }
            return {type: "array", elements: elementsMap} as ArrayValue
        }
        case "StringLiteral":
            return {type: "string", value: (<StringLiteral>node).value} as StringValue
        case "NumericLiteral":
            return {type: "number", value: (<NumericLiteral>node).value} as NumberValue
        case "BooleanLiteral":
            return {type: "boolean", value: (<BooleanLiteral>node).value} as BooleanValue
        case "NullLiteral":
            return {type: "null", value: null} as NullValue
        default:
            console.log("Unexpected node reached   " + node?.kind)
    }
}

export function evaluateBinaryExpression(binaryOperation: BinaryExpression, environment: Environment): RuntimeValue {
    const left = evaluateNode(binaryOperation.left, environment)
    const right = evaluateNode(binaryOperation.right, environment)
    if((left.type == "number" || left.type == "null") && (right.type == "number" || right.type == "null")) {
        switch(binaryOperation.operation) {
            case "!=":
                return {type: "boolean", value: left.value !== right.value} as BooleanValue
            case "==":
                return {type: "boolean", value: left.value === right.value} as BooleanValue
            case "=>":
                return {type: "boolean", value: left.value >= right.value} as BooleanValue
            case "<=":
                return {type: "boolean", value: left.value <= right.value} as BooleanValue
            case ">":
                return {type: "boolean", value: left.value > right.value} as BooleanValue
            case "<":
                return {type: "boolean", value: left.value < right.value} as BooleanValue
            case "+":
                return {type: "number", value: left.value + right.value } as NumberValue
            case "-":
                return {type: "number", value: left.value - right.value } as NumberValue
            case "*":
                return {type: "number", value: left.value * right.value } as NumberValue
            case "/":
                return {type: "number", value: left.value / right.value } as NumberValue
            case "%":
                return {type: "number", value: left.value % right.value } as NumberValue
            case "^":
                return {type: "number", value: left.value ** right.value } as NumberValue
        }
    }
    if(left.type == "boolean" && right.type == "boolean") {
        switch(binaryOperation.operation) {
            case "&":
                return {type: "boolean", value: left.value && right.value} as BooleanValue
            case "|":
                return {type: "boolean", value: left.value || right.value} as BooleanValue
            case "!=":
                return {type: "boolean", value: left.value !== right.value} as BooleanValue
            case "==":
                return {type: "boolean", value: left.value === right.value} as BooleanValue
            case "=>":
                return {type: "boolean", value: left.value >= right.value} as BooleanValue
            case "<=":
                return {type: "boolean", value: left.value <= right.value} as BooleanValue
            case ">":
                return {type: "boolean", value: left.value > right.value} as BooleanValue
            case "<":
                return {type: "boolean", value: left.value < right.value} as BooleanValue
        }
    }
    if(left.type == "string" && right.type == "string") {
        switch(binaryOperation.operation) {
            case "!=":
                return {type: "boolean", value: left.value !== right.value} as BooleanValue
            case "==":
                return {type: "boolean", value: left.value === right.value} as BooleanValue
            case "=>":
                return {type: "boolean", value: left.value >= right.value} as BooleanValue
            case "<=":
                return {type: "boolean", value: left.value <= right.value} as BooleanValue
            case ">":
                return {type: "boolean", value: left.value > right.value} as BooleanValue
            case "<":
                return {type: "boolean", value: left.value < right.value} as BooleanValue
            case "+":
                return {type: "string", value: left.value + right.value} as StringValue
        }
    }
}