const mysql = require('mysql');
class Database {
    constructor (options) {
        this.host = options.host;
        this.user = options.user;
        this.password = options.password;
        this.database = options.database;
        this.pool = null;
    }
    connect () {
        if (!this.pool) {
            this.pool = mysql.createPool({
                connectionLimit : 10,
                host : this.host,
                user : this.user,
                password : this.password,
                database : this.database,
                port : 3306
            })
        };
        return new Promise((resolve , reject) => {
            this.pool.getConnection((err , connection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            })
        });
    }
};
module.exports = Database;