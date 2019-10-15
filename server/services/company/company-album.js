const dao = require('../../dao/company/company-album');
const { 
    setCompanyUrl , 
    formatTime,
} = require('../../utils/index');
class AlbumServer {
    constructor () {
        this.domain = "http://www.jobui.com";
        this.albumType = {
            "1" : '电商',
            "2" : '创业典型',
            "3" : '最具潜力',
            '4' : '咨询/教育',
            '5' : '亲子服务',
            '6' : '建材家居',
            '7' : '社交',
            '8' : '知名品牌',
            '9' : '旅游',
            '10' : '艺术/收藏',
            '11' : '智能/创新科技',
            '12' : '金融',
            '13' : '一夜爆红',
            '14' : '餐饮',
            '15' : '用车服务',
            '16' : '女性/时尚',
            '17' : '环保',
            '18' : '娱乐/兴趣',
            '19' : '婚恋',
            '20' : '医疗',
            '21' : 'O2O',
            '22' : '应用软件',
            '23' : '全球化',
            '24' : '移动互联网',
            '25' : '家政',
            '26' : '企业服务',
            '27' : '吃货',
            '28' : '优质奖项',
            '29' : '电影'
        };
    }
    makeAlbumUrl (albumId , type , sortId) {
        let url = '/cmp/album/';
        if (type) {
            url += type + '/';
        }
        if (albumId) {
            url += albumId + '/';
        }
        if (sortId) {
            url += '?sortID=' + sortId;
        }
        return url;
    }
    async getAlbumList (page , pageSize , typeId , isDelete = 'N') {
        let result = [];
        let albumList = '';
        let isSort = false;
        if (typeId) {
            albumList = await dao.getAlbumListForTypeId(page , pageSize , typeId , isDelete);
            isSort = true;
        } else {
            albumList = await dao.getAlbumList(page , pageSize , isDelete);
        }
        for (let i = 0 ; i < albumList.length ; i++) {
            let data = {};
            let album = albumList[i];
            if (isSort) {
                data.albumId = album['CA_AlbumID'];
                let albumStatus = await dao.getAlbumStatus(data.albumId);
                albumStatus = albumStatus.length > 0 && albumStatus[0];
                data.companyNum = albumStatus['CSA_CompanyNum'];
                data.followNum = albumStatus['CSA_FollowNum'];
                data.addTime = formatTime(albumStatus['CSA_AddTime']);
                data.isRecommend = album['CSA_IsRecommend'];
            } else {
                data.albumId = album['CSA_AlbumID'];
                data.companyNum = album['CSA_CompanyNum'];
                data.followNum = album['CSA_FollowNum'];
                data.addTime = formatTime(album['CSA_AddTime']);
                data.isRecommend = album['CSA_IsRecommend'];
            }
            data.albumUrl = this.domain + this.makeAlbumUrl(data.albumId);
            let albumInfo = await dao.getAlbumInfo(data.albumId);
            albumInfo = albumInfo.length > 0 && albumInfo[0];
            data.albumTitle = albumInfo['CA_Title'];
            let albumSortList = await dao.getAlbumSortList(data.albumId);
            let sort = '';
            if (albumSortList.length > 0) {
                for (let i = 0 ; i < albumSortList.length ; i++) {
                    let oneSort = albumSortList[i];
                    sort += this.albumType[oneSort['CA_TypeID']] + ','
                }
                sort = sort.slice(0 , -1);
            }
            data.sort = sort;
            result.push(data)
        }
        return result;
    }
    getAlbumTotal (typeId , isDelete = 'N') {
        if (typeId) {
            return dao.getAlbumSortTotal(typeId , isDelete);
        } else {
            return dao.getAlbumTotal(isDelete);
        }
    }
    // 推荐专辑
    postRecommend (albumId) {
        return dao.postRecommend(albumId);
    }
}



module.exports = new AlbumServer();