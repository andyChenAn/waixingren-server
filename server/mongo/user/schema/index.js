const mongoose = require('mongoose');
const config = require('../config');
const user = new mongoose.Schema({
    _id : Number
} , {collection : config.collection});
module.exports = user;