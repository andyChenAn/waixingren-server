const url = process.env.NODE_ENV === 'production' ? '' : 'mongodb://192.168.1.26:27018/jobui_job2';
module.exports = {
    url,
    collection : 'job',
    name : 'jobui_job2'
}