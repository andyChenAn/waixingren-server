const DataBase = require('./index');
const host = process.env.NODE_ENV === 'production' ? '' : '192.168.1.13';
const user = process.env.NODE_ENV === 'production' ? '' : 'jobui_w';
const password = process.env.NODE_ENV === 'production' ? '' : '2mUWWqzEjChRfhYs';
const database = process.env.NODE_ENV === 'production' ? '' : 'system_setting';

const db = new DataBase({
    host,
    user,
    password,
    database
});

module.exports = db;