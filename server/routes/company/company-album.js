const Router = require('koa-router');
const router = new Router();
const service = require('../../services/company/company-album');

router.get('/' , async ctx => {
    const query = ctx.query;
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const typeId = query.typeId;
    try {
        let result = {};
        let total = '';
        let albumList = await service.getAlbumList(page , pageSize , typeId);
        total = await service.getAlbumTotal(typeId);
        total = total.length > 0 && total[0].total;
        let sortList = [];
        for (let key in service.albumType) {
            let data = {};
            data.typeId = key;
            data.sort = service.albumType[key];
            sortList.push(data);
        };
        result.code = 1;
        result.msg = 'success';
        result.total = total;
        result.data = {
            albumList,
            sortList
        }
        ctx.body = result;
    } catch (err) {
        console.log(err);
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

// 公司专辑推荐逻辑
router.post('/recommend' , async ctx => {
    let body = ctx.request.body;
    let albumId = body.albumId;
    if (!albumId) {
        ctx.body = {
            code : -1,
            msg : '缺少albumId'
        }
        return;
    }
    try {
        let result = {};
        let res = await service.postRecommend(albumId);
        if (res > 0) {
            result.code = 1;
            result.msg = 'success';
            ctx.body = result;
        }
    } catch (err) {
        console.log(err);
        let error = {};
        error.code = -1;
        error.msg = err.message;
        ctx.body = error;
    }
});

module.exports = router;