/**
 * 对 AbstractConfigFile 的方法进行 Promise 封装。
 */
class ConfigFilePromise {
    constructor(abstractConfigFile) {
        this.abstractConfigFile = abstractConfigFile;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.abstractConfigFile.load((err, config) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(config);
                }
            });
        });
    }

    save(config) {
        return new Promise((resolve, reject) => {
            this.abstractConfigFile.save(config, (err)=> {
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
            this.abstractConfigFile.update(partialConfig, (err, mergedConfig) => {
                if (err) {
                    reject(err);
                }else {
                    resolve(mergedConfig);
                }
            });
        });
    }

}

module.exports = ConfigFilePromise;