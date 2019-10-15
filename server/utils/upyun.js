const upyun = require('upyun');
class Upyun {
    constructor (serverName , userName , password) {
        this.serverName = serverName;
        this.userName = userName;
        this.password = password;
    }
    connect () {
        const service = new upyun.Service(this.userName , this.userName , this.password);
        const client = new upyun.Client(service);
        return client;
    }
};
module.exports = Upyun;