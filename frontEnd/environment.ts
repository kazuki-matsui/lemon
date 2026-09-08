import {RuntimeValue} from "./values";

export default class Environment {
    private parent?: Environment
    private variables: Map<string, RuntimeValue>
    private constants: string[]
    constructor(parentEnvironment?: Environment) {
        this.parent = parentEnvironment
        this.variables = new Map()
        this.constants = new Array<string>
    }
    public assign(identifier: string, value: RuntimeValue, constant: boolean, environment: this): RuntimeValue {
        environment.variables.set(identifier, value)
        if (constant) {
            environment.constants.push(identifier)
        }
        return value
    }

    public hasVariable(identifier: string) {
        return this.variables.has(identifier)
    }
    public hasConstant(identifier: string) {
        return this.constants.includes(identifier)
    }
    public getVariable(identifier: string) {
        const environment = this.resolve(identifier)
        return environment.variables.get(identifier)
    }
    public getVariables() {
        return this.variables
    }

    public resolve(identifier: string): Environment {
        if(this.variables.has(identifier)) {
            return this
        }
        if(this.parent == undefined) {
            throw `Cannot resolve ${identifier} as it does not exist`
        }
        return this.parent.resolve(identifier)
    }
}