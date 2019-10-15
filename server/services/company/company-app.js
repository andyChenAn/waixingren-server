const dao = require('../../dao/company/company-app');
const ImageClass = require('../../utils/image');
const { 
    formatTime,
} = require('../../utils/index');
class AppServer {
    constructor () {
        this.companyDomain = 'http://www.jobui.com';
        this.sourceName = {
            "1" : "豌豆荚",
            "2" : "百度手机助手",
            "3" : "360手机助手",
            "4" : "应用宝",
            "5" : "华为应用市场",
            "6" : "OPPO软件商店",
            "7" : "小米应用商店",
            "8" : "魅族应用商店",
            "9" : "苹果应用市场",
            "10" : "酷安",
            "11" : "PP助手"
        }
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    makeCompanySearchUrl (keyword) {
        let url = `/cmp?keyword=${keyword}`;
        return url;
    }
    async getList (page , pageSize , appName , type) {
        if (appName) {
            let productList = await this.getProductListByName(page , pageSize , appName);
            return productList;
        } else if (type == 'Y' || type == 'N' || type == 'A' || !type) {
            let appList = await this.getAppListByDefault(page , pageSize , type);
            return appList;
        }
    }
    // 获取app列表
    async getAppListByDefault (page , pageSize , type) {
        let appList = await dao.getAppListByDefault(page , pageSize , type);
        let result = [];
        if (appList.length > 0) {
            for (let i = 0 ; i < appList.length ; i++) {
                let data = {};
                let app = appList[i];
                let companyId = app['APC_ID'];
                data['adminProductCompanyID'] = companyId;
                if (app['APC_MatchCompanyID'] === '0') {
                    data.noFinid = true;
                } else if (app['APC_MatchCompanyID'] > 0 && app['APC_MatchCompanyID'] != null) {
                    data.isJobui = true;
                }
                let productList = await dao.getProductById(companyId);
                if (productList.length > 0) {
                    for (let i = 0 ; i < productList.length ; i++) {
                        let product = productList[i];
                        let productId = product['AP_ID'];
                        let productInfo = await dao.getProductGradeById(productId);
                        productInfo = productInfo.length > 0 && productInfo[0];
                        data['webSiteUrl'] = product['AP_Website'];
                        data['productName'] = product['AP_Name'];
                        data['downloadNum'] = productInfo['APG_Download'];
                        data['appUpdateTime'] = formatTime(productInfo['APG_AppUpdateTime']);
                    }
                };
                data['companyName'] = app['APC_CompanyName'];
                data['snatchTime'] = formatTime(app['APC_SnatchTime']);
                data['jobuiCompanyID'] = app['APC_MatchCompanyID'];
                data['companyUrl'] = this.companyDomain + this.makeCompanyUrl(app['APC_MatchCompanyID']);
                data['searchCompanyUrl'] = this.companyDomain + this.makeCompanySearchUrl(app['APC_CompanyName']);
                result.push(data);
            }
        }
        return result;
    }
    // 通过产品名称搜索的列表
    async getProductListByName (page , pageSize , appName) {
        let result = [];
        let productList = await dao.getProductListByName(page , pageSize , appName);
        if (productList.length > 0) {
            for (let i = 0 ; i < productList.length ; i++) {
                let data = {};
                let product = productList[i];
                data['website'] = product['AP_Website'];
                data['productName'] = product['AP_Name'];
                data['productId'] = product['AP_ID'];
                data['productSnatchTime'] = formatTime(product['AP_SnatchTime']);
                let companyId = product['AP_CompanyID'];
                let companyInfo = await dao.getCompanyInfoById(companyId);
                companyInfo = companyInfo.length > 0 && companyInfo[0];
                data['companyName'] = companyInfo['APC_CompanyName'];
                let gradeInfo = await dao.getProductGradeById(product['AP_ID']);
                gradeInfo = gradeInfo.length > 0 && gradeInfo[0];
                if (gradeInfo) {
                    data['gradeSourceName'] = this.sourceName[gradeInfo['APG_AppMarketSource']];
                    data['appUpdateTime'] = formatTime(gradeInfo['APG_AppUpdateTime']);
                    data['downloadNum'] = gradeInfo['APG_Download'];
                    data['gradeSourceUrl'] = gradeInfo['APG_AppMarketSourceURL'];
                }
                result.push(data);
            }
        }
        return result;
    }
    // 获取总数
    async getTotal (appName , type) {
        if (appName) {
            let total = await dao.getTotalByName(appName);
            total = total.length > 0 && total[0].total;
            return total;
        } else if (type == 'Y' || type == 'N' || type == 'A' || !type) {
            let total = await dao.getTotalByType(type);
            total = total.length > 0 && total[0].total;
            return total;
        }
    }
    // 合并APP
    async mergeAdminProductToJobui (isMatch , adminProductCompanyId , jobuiCompanyId) {
        // 先检查一下之前是否已经将产品与公司匹配过了，或者公司根本没有这个产品
        let companyInfo = await dao.getCompanyInfoById(adminProductCompanyId);
        if (companyInfo.length == 0 || companyInfo[0]['APC_MatchCompanyID'] === 0 || companyInfo[0]['APC_MatchCompanyID'] > 0) {
            return -10;
        }
        let update = '';
        if (isMatch == 'Y') {
            // 可以在站内匹配到的
            update = await dao.updateInfoById(adminProductCompanyId , jobuiCompanyId);
            if (update > 0) {
                let productList = await dao.getProductById(adminProductCompanyId);
                if (productList.length == 0) {
                    return -1;
                }
                let productInfo = await dao.getProductStatus(jobuiCompanyId);
                productInfo = productInfo.length > 0 && productInfo[0];
                let productNum = productInfo['CSP_ProductNum'];
                for (let i = 0 ; i < productList.length ; i++) {
                    let product = productList[i];
                    let adminProductId = product['AP_ID'];
                    let adminProductName = product['AP_Name'];
                    let adminProductLogoPath = product['AP_LogoPath'];
                    let adminProductWebsite = product['AP_Website'];
                    let adminProductDesc = product['AP_Description'];
                    let adminProductShortContent = product['AP_ShortContent'];
                    let adminProductFirstCategory = product['AP_FirstCategory'];
                    let adminProductSecondCategory = product['AP_SecondCategory'];
                    let adminProductThirdCategory = product['AP_ThirdCategory'];
                    let adminProductSnatchTime = product['AP_SnatchTime'];
                    let update = await dao.insertProduct(jobuiCompanyId , adminProductName , adminProductWebsite , adminProductLogoPath , adminProductDesc , 'N' , '' , '' , 'Y' , 'Y' , adminProductShortContent , adminProductFirstCategory , adminProductSecondCategory , adminProductThirdCategory , adminProductSnatchTime);
                    if (update > 0) {
                        productNum += 1;
                        if (adminProductLogoPath) {
                            await this.mergeAdminProductLogo(jobuiCompanyId , adminProductId , adminProductLogoPath);
                        }
                        // 将产品添加到表中之后，又从表中取出这一条数据
                        let product = await dao.getProductByName(adminProductName);
                        product = product.length > 0 && product[0];
                        let jobuiProductId = product['CP_ID'];
                        await this.mergeAdminProductPhoto(jobuiProductId , adminProductId);
                        await this.mergeAdminProductGrade(jobuiProductId , adminProductId);
                    }
                }
                // 更新状态
                await this.updateCompanyProductStatus(jobuiCompanyId , productNum , 101);
            }
        } else {
            // 在站内找不到的
            update = await dao.updateProductForNotFound(adminProductCompanyId);
        }
        return update;
    }
    async mergeAdminProductLogo (jobuiCompanyId , adminProductId , adminProductLogoPath) {
        let image = new ImageClass();
        let sourceDir = image.seperateUserPath(adminProductId);
        let targetDir = image.seperateUserPath(jobuiCompanyId);
        let sourcePath = '/adminProductLogo' + sourceDir + adminProductLogoPath;
        let targetPath = '/productLogo' + targetDir;
        return image.downLoadAndUploadImage(sourcePath , targetPath , adminProductLogoPath);
    }
    async mergeAdminProductPhoto (jobuiProductId , adminProductId) {
        let image = new ImageClass();
        let page = 1;
        let pageSize = 10;
        let photoList = await dao.getAdminProductImageList(adminProductId , page , pageSize);
        while (photoList.length > 0) {
            for (let i = 0 ; i < photoList.length ; i++) {
                let photo = photoList[i];
                let photoPath = photo['APP_Path'];
                let result = await dao.addProductInfoPhoto(jobuiProductId , photoPath , 'N' , photo ['APP_SnatchTime']);
                if (result > 0) {
                    let sourceDir = image.seperateUserPath(adminProductId);
                    let targetDir = image.seperateUserPath(jobuiProductId);
                    let sourcePath = '/adminProductInfoLogo' + sourceDir + photoPath;
                    let targetPath = '/productInfoLogo' + targetDir;
                    image.downLoadAndUploadImage(sourcePath , targetPath , photoPath);
                }
            };
            page++;
            photoList = await dao.getAdminProductImageList(adminProductId , page , pageSize);
        }
    }
    // 合并产品的评分
    async mergeAdminProductGrade (jobuiProductId , adminProductId) {
        let page = 1;
        let pageSize = 15;
        let  gradeList = await dao.getAdminProductGradeList(adminProductId , page , pageSize);
        if (gradeList.length > 0) {
            for (let i = 0 ; i < gradeList.length ; i++) {
                let grade = gradeList[i];
                await dao.addProductGradeInfo(jobuiProductId , grade['APG_AppMarketSource'] , grade['APG_Grade'] , grade['APG_Download'] , grade['APG_AppMarketSourceURL'] , grade['APG_AppVersion'] , grade['APG_AppUpdateTime'] , grade['APG_SnatchTime']);
            }
        };
    }
    // 更新
    async updateCompanyProductStatus (companyId , num , userId) {
        if (!companyId || !userId) {
            return -1;
        }
        let product = await dao.getStatusById(productId);
        let update = '';
        // 如果已经存在，那么更新状态
        // 如果不存在，那么插入一条新的数据
        if (product.length > 0) {
            update = await dao.updateCompanyStatus(companyId , num , userId);
        } else {
            update = await dao.insertCompanyStatus(companyId , num , userId);
        }
        return update;
    }
}
module.exports = new AppServer();