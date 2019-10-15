const db = require('../../db/company');
class AlbumDao {
    // 查询方法，一个私有方法，提供查询功能
    _select (db , sql , sqlParams) {
        return db.connect().then(connection => {
            return new Promise((resolve , reject) => {
                connection.query(sql , sqlParams , (err , result) => {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        })
    }
    // 更新方法，一个私有方法，提供更新功能
    _update (db , sql , sqlParams) {
        return db.connect().then(connection => {
            return new Promise((resolve , reject) => {
                connection.query(sql , sqlParams , (err , result) => {
                    connection.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(1);
                    }
                })
            })
        })
    }
    // 获取公司专辑列表
    getAlbumList (page , pageSize , isDelete) {
        let sql = `select * from \`tb_company_status_album\` where CSA_IsDelete = '${isDelete}'`;
        sql += ` order by CSA_RecommendUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过专辑id获取相应的公司专辑信息
    getAlbumInfo (albumId) {
        let sql = `select * from \`tb_company_albumInfo-list\` where CA_ID = '${albumId}'`;
        return this._select(db , sql);
    }
    // 通过专辑id获取相应的公司专辑排序列表
    getAlbumSortList (albumId) {
        let sql = `select * from \`tb_company_albumSort-list\` where CA_AlbumID = '${albumId}'`;
        return this._select(db , sql);
    }
    // 获取列表总数
    getAlbumTotal (isDelete) {
        let sql = `select count(*) as total from \`tb_company_status_album\` where CSA_IsDelete ='${isDelete}'`;
        return this._select(db , sql);
    }
    // 通过公司专辑类型id查询列表
    getAlbumListForTypeId (page , pageSize , typeId , isDelete) {
        let sql = `select * from \`tb_company_albumSort-list\` where CA_TypeID = '${typeId}' and CA_IsDelete = '${isDelete}'`;
        sql += ` order by CA_LastUpdateTime desc limit ${(page - 1) * pageSize} , ${pageSize}`;
        return this._select(db , sql);
    }
    // 通过专辑id获取专辑状态
    getAlbumStatus (albumId) {
        let sql = `select * from \`tb_company_status_album\` where CSA_AlbumID = '${albumId}'`;
        return this._select(db , sql);
    }
    // 通过类型id获取公司专辑总数
    getAlbumSortTotal (typeId , isDelete) {
        let sql = `select count(*) as total from \`tb_company_albumSort-list\` where CA_TypeID = '${typeId}' and CA_IsDelete = '${isDelete}'`;
        return this._select(db , sql);
    }
    // 公司专辑推荐
    postRecommend (albumId) {
        let updateTime = parseInt(new Date().getTime() / 1000);
        let sql = `update \`tb_company_status_album\` set CSA_IsRecommend = ? , CSA_RecommendUpdateTime = ? , CSA_LastUpdateTime = ? where CSA_AlbumID = ?`;
        let sqlParams = [1 , updateTime , updateTime , albumId];
        return this._update(db , sql , sqlParams);
    }
}
module.exports = new AlbumDao();