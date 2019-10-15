const mongoose = require('mongoose');
const config = require('../config');
const snatchJobSchema = new mongoose.Schema({
    _id : Number
} , {collection : config.collection});
module.exports = snatchJobSchema;