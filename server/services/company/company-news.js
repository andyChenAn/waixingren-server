const dao = require('../../dao/company/company-news');
const { 
    formatTime,
} = require('../../utils/index');
class CompanyNewsServer {
    constructor () {
        // 公司新闻推广状态
        this.promotionStatus = {
            "check" : "U",   // 推广审核
            "pass" : "Y",   // 推广通过
            "off" : 'N'   // 推广下线
        };
        this.companyDomain = 'http://www.jobui.com';
    }
    makeCompanyNewsURL (companyId , newsId) {
        if (!companyId) {
            return '/';
        }
        if (newsId) {
            return `/company/${companyId}/news/${newsId}/`;
        } else {
            return `/company/${companyId}/news/`;
        }
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getNewsList (page , pageSize , type , companyId , newsId , industry) {
        // 推广和通过，这两种情况
        let newsList = [];
        let promotionStatus = this.promotionStatus[type];
        if (promotionStatus) {
            // 推广审核，推广通过，推广已下线
            if (type == 'off') {
                newsList = await this.getNewsListByPromotionStatus(promotionStatus , page , pageSize , true);
            } else {
                newsList = await this.getNewsListByPromotionStatus(promotionStatus , page , pageSize , false);
            }
        } else if (type == 'M') {
            // 未匹配
            newsList = await this.getNesListByMatch(page , pageSize);
        }  else {
            // 获取公司列表，通过行业或者不通过行业
            if (!industry) {
                newsList = await this.getNewsListByDefault(page , pageSize , type , companyId , newsId);
            } else {
                newsList = await this.getNewsListByIndustry(industry , type , page , pageSize);
            }
        };
        return newsList;
    }
    // 获取公司新闻列表
    async getNewsListByDefault (page , pageSize , type , companyId , newsId) {
        let newsList = await dao.getNewsListByDefault(page , pageSize , type , companyId , newsId);
        let result = [];
        if (newsList.length > 0) {
            for (let i = 0 ; i < newsList.length ; i++) {
                let news = newsList[i];
                let data = await this.generateNewsData(news , type);
                result.push(data);
            }
        }
        return result;
    }
    // 通过行业来筛选新闻列表
    async getNewsListByIndustry (industry , type , page , pageSize , newsTime = '') {
        let result = [];
        let newsList = await dao.getNewsListByIndustry(industry , type , page , pageSize , newsTime);
        if (newsList.length > 0) {
            for (let i = 0 ; i < newsList.length ; i++) {
                let news = newsList[i];
                let newsInfo = await dao.getNewsInfo(news['CNC_NewsID']);
                newsInfo = newsInfo.length > 0 && newsInfo[0];
                let data = await this.generateNewsData(newsInfo , type);
                result.push(data);
            }
        };
        return result;
    }
    // 生成的公司新闻数据
    async generateNewsData (news , type) {
        let data = {};
        data.companyId = news['CN_CompanyID'];
        data.newsId = news['CN_ID'];
        data.addTime = formatTime(news['CN_NewTime']);
        data.lastUpdateTime = formatTime(news['CN_LastUpdateTime']);
        // 源网站链接
        data.sourceUrl = news['CN_Url'];
        // 新闻标题
        data.newsTitle = news['CN_Title'];
        data.newsTitleUrl = this.companyDomain + this.makeCompanyNewsURL(news['CN_CompanyID'] , news['CN_ID']);
        // 公司名称
        let company = await dao.getCompanyDataById(news['CN_CompanyID']);
        data.companyName = company['CI_Name'];
        data.companyUrl = this.companyDomain + this.makeCompanyNewsURL(news['CN_CompanyID']);
        data.status = news['CN_IsDelete'];
        // 删除状态
        if (news['CN_IsDelete'] == 'Y') {
            data.addTime = formatTime(news['CN_LastUpdateTime']);
            data.isDelete = true;
        } else if (news['CN_IsDelete'] == 'N') {
            data.isPass = true;
        }
        // 显示选中框
        if (type == 'N') {
            data.isShow = true;
        };
        data.isHRPublish = false;
        if (news['CN_WebSite'] == 'HR发布') {
            data.isHRPublish = true;
        };
        return data;
    }
    // 通过type为M来筛选公司新闻列表
    async getNesListByMatch (page , pageSize) {
        let newsList = await dao.getNesListByMatch(page , pageSize);
        let result = [];
        if (newsList.length > 0) {
            for (let i = 0 ; i < newsList.length ; i++) {
                let data = {};
                let news = newsList[i];
                data.newsTitle = news['ACN_Title'];
                data.newsTitleUrl = news['ACN_Url'];
                data.newTime = formatTime(news['ACN_NewTime']);
                result.push(data);
            }
        }
        return result;
    }
    // 通过推广状态获取新闻列表
    async getNewsListByPromotionStatus (status , page , pageSize , hasPromotionTime) {
        let newsList = await dao.getNewsListByPromotionStatus(status , page , pageSize , hasPromotionTime);
        let result = [];
        if (newsList.length > 0) {
            for (let i = 0 ; i < newsList.length > 0 ; i++) {
                let data = {};
                let news = newsList[i];
                let company = await dao.getCompanyDataById(news['CN_CompanyID']);
                data.newsId = news['CN_ID'];
                data.companyId = news['CN_CompanyID'];
                data.newsTitle = news['CN_Title'];
                data.companyName = company['CI_Name'];
                data.companyUrl = this.companyDomain + this.makeCompanyUrl(news['CN_CompanyID']);
                data.newsInfoUrl = this.companyDomain + this.makeCompanyNewsURL(news['CN_CompanyID'] , news['CN_ID']);
                if (news['CN_PromotionTime']) {
                    data.promotionTime = formatTime(news['CN_PromotionTime']);
                } else {
                    data.promotionTime = '';
                }
                if (news['CN_IsPromotion'] == 'Y') {
                    data.isPass = true;
                } else if (news['CN_IsPromotion'] == 'N') {
                    data.notPass = true;
                };
                result.push(data);
            }
        }
        return result;
    }
    // 获取公司新闻总数
    async getNewsTotal (type , companyId , newsId , industry) {
        let total = '';
        let promotionStatus = this.promotionStatus[type];
        if (promotionStatus) {
            // 推广审核，推广通过，推广已下线总数
            if (type == 'off') {
                total = await dao.getNewsTotalByPromotionStatus(promotionStatus ,true);
                total = total.length > 0 && total[0].total;
            } else {
                total = await dao.getNewsTotalByPromotionStatus(promotionStatus , false);
                total = total.length > 0 && total[0].total;
            }
        } else if (type == 'M') {
            // 未匹配总数
            total = await dao.getNewsTotalByMatch();
            total = total.length > 0 && total[0].total;
        }  else {
            // 获取公司列表总数，通过行业或者不通过行业
            if (!industry) {
                total = await dao.getNewsTotalByDefault(type , companyId , newsId);
                total = total.length > 0 && total[0].total;
            } else {
                total = await dao.getNewsTotalByIndustry(industry , type , '');
                total = total.length > 0 && total[0].total;
            }
        };
        return total;
    }
    // 更新公司新闻
    async updateByNewsId (newsId , type , companyId , status) {
        // 批量操作和单独操作
        let update = await dao.updateByNewsId(newsId , type , companyId);
        let num = 1;
        // 通过或者删除
        if (type == 'Y') {
            num = -1;
        } else {
            num = 1;
        };
        if (update > 0) {
            let update = await dao.updateNewsStatus(newsId , type);
            if (update > 0) {
                if (status != 'U' || (status == 'U' && type == 'N')) {
                    // 更新状态表
                    let companyInfo = await dao.getCompanyInfoById(companyId);
                    companyInfo = companyInfo.length > 0 && companyInfo[0];
                    if (num > 0) {
                        num += Number(companyInfo['CSN_NewsNum']);
                    } else {
                        if (Number(companyInfo['CSN_NewsNum']) <= 0) {
                            return 1;
                        }
                        num = Number(companyInfo['CSN_NewsNum']) - Math.abs(num);
                    }
                    let update = await dao.updateNumById(companyId , num);
                    return update;
                }
            }
        }
    }
}

module.exports = new CompanyNewsServer();