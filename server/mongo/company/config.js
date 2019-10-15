const url = process.env.NODE_ENV === 'production' ? '' : 'mongodb://192.168.1.26:27018/jobui_company';
module.exports = {
    url,
    collection : 'company',
    name : 'jobui_company'
}