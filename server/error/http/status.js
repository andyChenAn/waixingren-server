const errorStatus = {
    "400" : {
        code : "400",
        message : "请求错误，服务器不理解请求的语法"
    },
    "404" : {
        code : "404",
        message : "请求的接口不存在"
    },
    "500" : {
        code : "500",
        message : "服务器遇到错误，无法完成请求"
    },
    "501" : {
        code : "501",
        message : "服务器不具备完成请求的功能"
    },
    "502" : {
        code : "502",
        message : "服务器作为网关或代理，从上游服务器收到无效响应"
    },
    "503" : {
        code : "503",
        message : "服务器目前无法使用，由于超载或停机维护。通常，这只是暂时状态"
    }
};
module.exports = errorStatus;