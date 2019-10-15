const dao = require('../../dao/company/company-recharge');
const { 
    formatTime,
} = require('../../utils/index');
class RechargeServer {
    constructor () {
        this.companyDomain = 'http://www.jobui.com';
    }
    makeCompanyUrl (companyId) {
        if (!companyId) {
            return '';
        }
        return `/company/${companyId}/`;
    }
    async getRechargeList (page , pageSize , companyId , type) {
        // 获取订单状态，0表示未支付，1表示已支付
        let orderStatus = '';
        if (type == 'N') {
            orderStatus = 0;
        } else {
            orderStatus = 1;
        }
        let result = [];
        if ((orderStatus === 0 || orderStatus === 1) && type != "R") {
            let orderList = await dao.getOrderList(orderStatus , page , pageSize , companyId);
            if (orderList.length > 0) {
                for (let i = 0 ; i < orderList.length ; i++) {
                    let data = {};
                    let order = orderList[i];
                    data.companyId = order['COI_CompanyID'];
                    let company = await dao.getCompanyDataById(order['COI_CompanyID']);
                    data.companyName = company['CI_Name'];
                    data.area = company['CI_Area'];
                    data.companyUrl = this.companyDomain + this.makeCompanyUrl(order['COI_CompanyID']);
                    data.chargeAmount = order['COI_ChargeAmount'];
                    data.orderTime = formatTime(order['COI_OrderTime']);
                    result.push(data);
                }
            }
            return result;
        };
        // 赠送记录
        if (type == 'R') {
            let recordList = await dao.getRecordList(companyId , page , pageSize);
            if (recordList.length > 0) {
                for (let i = 0 ; i < recordList.length ; i++) {
                    let data = {};
                    let record = recordList[i];
                    data.pointNum = record['AGL_PointNum'];
                    data.companyId = record['AGL_CompanyID'];
                    data.companyUrl = this.companyDomain + this.makeCompanyUrl(record['AGL_CompanyID']);
                    data.adminName = record['AGL_AdminName'];
                    data.addTime = formatTime(record['AGL_LastUpdateTime']);
                    let company = await dao.getCompanyDataById(record['AGL_CompanyID']);
                    data.companyName = company['CI_Name'];
                    result.push(data);
                }
            }
            return result;
        }
    }
    async getRechargeTotal (type , companyId) {
        let total = '';
        // 获取订单状态，0表示未支付，1表示已支付
        let orderStatus = '';
        if (type == 'N') {
            orderStatus = 0;
        } else {
            orderStatus = 1;
        }
        if (type == 'Y' || type == 'N') {
            total = await dao.getRechargeTotal(orderStatus , companyId);
            total = total.length > 0 && total[0].total;
        } else if (type == 'R') {
            total = await dao.getRecordTotal(companyId);
            total = total.length > 0 && total[0].total;
        }
        return total;
    }
}
module.exports = new RechargeServer();