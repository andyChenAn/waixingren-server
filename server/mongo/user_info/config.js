const url = process.env.NODE_ENV === 'production' ? '' : 'mongodb://192.168.1.26:27018/jobui_user_info';
module.exports = {
    url,
    collection : "userInfo",
    name : 'jobui_user_info'
};