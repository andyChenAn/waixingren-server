const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const cors = require('koa-cors');
const app = new Koa();
const router = new Router();
const log4js = require('log4js');
const logger = log4js.getLogger('log');
const RequestError = require('./error/http/index');
const errorStatus = require('./error/http/status');
const shortCommentRouter = require('./routes/company/short-comment');
const longCommentRouter = require('./routes/company/long-comment');
const impressionRouter = require('./routes/company/impression');
const productRouter = require('./routes/company/product-comment');
const environmentCommentRouter = require('./routes/company/environment-comment');
const longReplyRouter = require('./routes/company/long-reply');
const shortReplyRouter = require('./routes/company/short-reply');
const environmentRouter = require('./routes/company/environment');
const logoRouter = require('./routes/company/company-logo');
const albumRouter = require('./routes/company/company-album');
const teamRouter = require('./routes/company/company-team');
const deleteCompanyRouter = require('./routes/company/company-delete');
const companyMegerRouter = require('./routes/company/company-merge');
const companyRegisterRouter = require('./routes/company/company-register');
const companyNewsRouter = require('./routes/company/company-news');
const companyFilterRouter = require('./routes/company/company-filter');
const companyRankRouter = require('./routes/company/company-rank');
const companyRechargeRouter = require('./routes/company/company-recharge');
const companyAppRouter = require('./routes/company/company-app');
const companyShortNameRouter = require('./routes/company/company-shortname');
const companyFinancingRouter = require('./routes/company/company-financing');
const jobCollectRouter = require('./routes/job/job-collect');

app.use(bodyParser());

router.get('/' , async (ctx) => {
    ctx.body = 'hello world';
});

// 跨域
app.use(cors());

// 公司短评api
router.use('/api/shortcomment' , shortCommentRouter.routes());
// 公司长评api
router.use('/api/longcomment' , longCommentRouter.routes());
// 公司印象api
router.use('/api/impression' , impressionRouter.routes());
// 公司产品评论api
router.use('/api/productcomment' , productRouter.routes());
// 公司环境评论api
router.use('/api/environmentcomment' , environmentCommentRouter.routes());
// 公司长评回复api
router.use('/api/longreply' , longReplyRouter.routes());
// 公司短评回复api
router.use('/api/shortreply' , shortReplyRouter.routes());
// 公司环境api
router.use('/api/environment' , environmentRouter.routes());
// 公司logo api
router.use('/api/logo' , logoRouter.routes());
// 公司专辑api
router.use('/api/album' , albumRouter.routes());
// 公司管理团队api
router.use('/api/team' , teamRouter.routes());
// 删除公司api
router.use('/api/delete' , deleteCompanyRouter.routes());
// 合并公司api
router.use('/api/merge' , companyMegerRouter.routes());
// 公司认领api 未完成
router.use('/api/register' , companyRegisterRouter.routes());
// 公司新闻api
router.use('/api/news' , companyNewsRouter.routes());
// 可信公司api
router.use('/api/filter' , companyFilterRouter.routes());
// 新上榜公司api
router.use('/api/newrank' , companyRankRouter.routes());
// 企业充值api
router.use('/api/recharge' , companyRechargeRouter.routes());
// 公司APP信息api
router.use('/api/app' , companyAppRouter.routes());
// 公司简称api
router.use('/api/shortname' , companyShortNameRouter.routes());
// 公司融资api
router.use('/api/financing' , companyFinancingRouter.routes());

// 职位收藏api
router.use('/api/job/collect' , jobCollectRouter.routes());


app.use(router.routes());

// 如果所有的接口api都不匹配，那么就表示请求的接口不存在
app.use(ctx => {
    try {
        throw new RequestError(errorStatus['404']);
    } catch (err) {
        logger.error(JSON.stringify(err.getInfo()));
        let result = {};
        result.code = -1;
        result.message = 'fail';
        result.error = err.message;
        ctx.body = result;
    }
});

app.listen(3000 , () => {
    console.log('listening port on 3000');
})