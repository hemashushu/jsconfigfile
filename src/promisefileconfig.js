/**
 * 对 AbstractFileConfig 的方法进行 Promise 封装。
 */
class PromiseFileConfig {
    constructor(abstractFileConfig) {
        this.abstractFileConfig = abstractFileConfig;
    }

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

    update(partialConfig) {
        return new Promise((resolve, reject) => {
            this.abstractFileConfig.update(partialConfig, (err, mergedConfig) => {
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