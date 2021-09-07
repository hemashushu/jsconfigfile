/**
 * 对 AbstractFileConfig 的方法进行 Promise 封装。
 */
class PromiseFileConfig {
    constructor(abstractFileConfig) {
        this.abstractFileConfig = abstractFileConfig;
    }

    /**
     * - 如果配置文件内容有错误（如语法错误，数据格式错误等）而无法解析，则抛出
     *   ParseException 异常。
     * - 如果文件找不到，则抛出 FileNotFound 异常。
     * - 如果出现其他 IO 错误，则抛出 IOException 对象。
     *
     * @param {*} filePath
     * @returns 值是纯数据对象。
     *     - 本模块不支持内容为非数据对象的配置文件，比如内容是一个数组或者一个字符串这种；
     *     - 当文件内容是空时，返回一个空数据对象：{}
     *     - 当文件无实际内容时，比如只有注释，返回一个空数据对象：{}
     */
    load(filePath) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.load(filePath, (err, config) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(config);
                }
            });
        });
    }

    loadWithResolvePlaceholder(filePath, contextObject) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.loadWithResolvePlaceholder(
                filePath, contextObject, (err, config)=>{
                if (err) {
                    reject(err);
                }else {
                    resolve(config);
                }
            });
        });
    }

    loadWithPreprocess(filePath, preprocessFunc) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.loadWithPreprocess(
                filePath, preprocessFunc, (err, config)=>{
                if (err) {
                    reject(err);
                }else {
                    resolve(config);
                }
            });
        });
    }

    save(filePath, config) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.save(filePath, config, (err)=> {
                if (err) {
                    reject(err);
                }else {
                    resolve();
                }
            });
        });
    }

    update(filePath, partialConfig) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.update(filePath, partialConfig, (err, mergedConfig) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(mergedConfig);
                }
            });
        });
    }

    updateByFile(filePath, sourceFilePath) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.updateByFile(filePath, sourceFilePath, (err, mergedConfig) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(mergedConfig);
                }
            });
        });
    }

}

module.exports = PromiseFileConfig;