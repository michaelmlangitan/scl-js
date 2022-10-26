export class SclSyntaxException extends Error {
    lineno: number;
    cursor: number;
    contents?: string;

    constructor (message: string, lineno: number, cursor: number, contents?: string) {
        super(message)
        this.message = message;
        this.lineno = lineno;
        this.cursor = cursor;
        this.contents = contents;

        (<any> Object).setPrototypeOf(this, SclSyntaxException.prototype)
    }
}

export class LogicException extends Error {
    constructor(message: string) {
        super(message);
        this.message = message;
        (<any> Object).setPrototypeOf(this, LogicException.prototype)
    }
}