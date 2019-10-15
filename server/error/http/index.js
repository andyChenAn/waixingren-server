class RequestError extends Error {
    constructor (options) {
        super();
        this.status = options.code;
        this.message = options.message;
    }
    getStatus () {
        return this.status;
    }
    getMessage () {
        return this.message;
    }
    getInfo () {
        return {
            status : this.status,
            message : this.message
        }
    }
}
module.exports = RequestError;