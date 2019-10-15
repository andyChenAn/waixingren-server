class CodeError extends Error {
    constructor (error) {
        super();
        this.message = error.message;
        let stacks = error.stack.split('\n');
        this.stack = stacks[0].trim() + stacks[1].trim();
    }
    getMessage () {
        return this.message;
    }
    getStack () {
        return this.stack;
    }
    getInfo () {
        return {
            message : this.message,
            stack : this.stack
        }
    }
}
module.exports = CodeError;