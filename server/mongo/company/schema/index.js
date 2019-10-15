const mongoose = require('mongoose');
const config = require('../config');
const companySchema = new mongoose.Schema({
    _id : Number
} , {collection : config.collection});
module.exports = companySchema;