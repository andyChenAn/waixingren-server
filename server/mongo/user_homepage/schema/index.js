const mongoose = require('mongoose');
const config = require('../config');
const UserHomePageSchema = new mongoose.Schema({
    _id : Number
} , {collection : config.collection});
module.exports = UserHomePageSchema;