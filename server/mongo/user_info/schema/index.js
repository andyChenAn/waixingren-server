const mongoose = require('mongoose');
const config = require('../config');
const userInfo = new mongoose.Schema({
    _id : Number
} , {collection : config.collection});
module.exports = userInfo;