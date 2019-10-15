const axios = require('axios');
/**
 * 
 * @param {number} id 用户ID
 * @param {string} type 图片大小类型，s表示小图，m表示中图，b表示大图
 */
exports.setUserLogo = function (id , type) {
    let url = `http://p.jobui.com/u/?p=${id}`;
    if (!id) {
        return '/';
    }
    if (type) {
        url += '-' + type;
    }
    return url;
};
// 设置长评详细页
exports.setCommentUrl = function (companyId , commentId) {
    if (!companyId || !commentId) {
        return null;
    }
    return `/company/${companyId}/review/${commentId}/`;
}
// 设置个人主页url
exports.setUserHomepage = function (id , isMobile = false) {
    let url = '';
    if (isMobile) {
        url = 'http://m.jobui.com/people/';
    } else {
        url = '/people/';
    }
    if (id) {
        url += id + '/';
    };
    return url;
};
// 设置公司url
exports.setCompanyUrl = function (companyId) {
    if (!companyId) {
        return '';
    }
    return `/company/${companyId}/`;
};
// 通过ip获取城市
exports.getCityFromIp = function (ip) {
    return axios.get(`http://ip-api.com/json/${ip}?lang=zh-CN`)
    .then(res => {
        return res.data.city;
    })
    .catch(err => {
        console.log(err);
    })
};
// 格式化时间戳
exports.formatTime = function (timestamp) {
    if (!timestamp) {
        timestamp = 0;
    };
    let date = new Date(timestamp * 1000);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return year + '年' + month + '月' + day + '日' + ' ' + hours + ':' + minutes + ':' + seconds;
};
// 生成产品评论url
exports.setProductCommentUrl = function (companyId , productId) {
    if (!companyId || !productId) {
        return '/';
    }
    let url = `/company/${companyId}/products/${productId}`;
    return url;
};
// 生成环境评论url
exports.setEnvironmentCommentUrl = function (companyId , commentId)  {
    if (!companyId || !commentId) {
        return '/';
    }
    let url = `/company/${companyId}/photos/${commentId}`;
    return url;
}