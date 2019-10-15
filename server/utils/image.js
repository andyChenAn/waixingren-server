const fs = require('fs');
const crypto = require('crypto');
const Upyun = require('../utils/upyun');
class ImageClass {
    constructor () {
        this.maxSize = 4096000;
        this.dir = '/web/jobui_file/';
        this.type = ['image/gif' , 'image/jpeg' , 'image/png'];
    }
    splitImage (str , size) {
        let arr = [];
        let step = 0;
        str = str + '';
        let clone = str;
        while (clone.charAt(step)) {
            let ss = str.slice(0 , size);
            arr.push(ss);
            step += size;
            str = clone.slice(step);
        }
        return '/' + arr.join('/') + '/';
    }
    // 将字符串已三个字符分割并且通过/分隔符分分隔
    seperateUserPath (str , size = 3) {
        let path = this.splitImage(str , size);
        return path;
    }
    // 下载图片到本地再重新上传到又拍云
    downLoadAndUploadImage (remotePath , targetDir , fileName) {
        let path = '/waixingren/';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        };
        const upyun = new Upyun('jobuidemo' , 'jobuidemo' , 'jobui@#demo');
        const saveTo = fs.createWriteStream(path + fileName);
        upyun.connect().getFile(remotePath , saveTo).then(res => {
            this.uploadImageToUpyun(path + fileName , targetDir , fileName)
        });
    }
    /**
     * 将本地图片上传到又拍云
     * @param {*} type 
     * @param {*} localDir 本地图片的路径
     * @param {*} targetDir 上传到又拍云上的路径
     * @param {*} fileName 文件名
     */
    uploadImageToUpyun (localDir , targetDir , fileName , compression = 0) {
        const upyun = new Upyun('jobuidemo' , 'jobuidemo' , 'jobui@#demo');
        function md5 (str) {
            let crypto_md5 = crypto.createHash('md5');
            crypto_md5.update(str , 'utf8');
            return crypto_md5.digest('hex');
        }
        let options = {
            "Content-Secret" : md5(fileName + 'jobui@img')
        };
        const stat = fs.statSync(localDir);
        // 如果原图大于1M就进行压缩，压缩图片质量：50%
        if (compression > 0 || (stat.size > this.maxSize / 4)) {
            options['x-gmkerl-thumbnail'] = 'compression50';
        };
        upyun.connect().putFile(targetDir + fileName , localDir , options).then(res => {
            console.log('上传图片成功');
        })
    }
};
module.exports = ImageClass;