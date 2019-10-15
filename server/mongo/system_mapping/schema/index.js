const mongoose = require('mongoose');
const config = require('../config');
const systemMappingSchema = new mongoose.Schema({

} , {collection : config.collection});
module.exports = systemMappingSchema;