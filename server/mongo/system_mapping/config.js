const url = process.env.NODE_ENV === 'production' ? '' : 'mongodb://192.168.1.26:27018/system_mapping';
module.exports = {
    url,
    collection : 'mapping',
    name : "mapping"
};