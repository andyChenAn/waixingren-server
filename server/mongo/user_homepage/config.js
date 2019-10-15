const url = process.env.NODE_ENV === 'production' ? '' : 'mongodb://192.168.1.26:27018/jobui_user_domain';
module.exports = {
    url,
    collection : 'userDomain',
    name : 'jobui_user_domain'
};