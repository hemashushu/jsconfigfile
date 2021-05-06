const fs = require('fs');

const AbstractConfigFile = require('./abstractconfigfile');

class JSONConfigFile extends AbstractConfigFile {
    constructor(filePath) {
        super(filePath);
    }

    load(callback) {
        fs.readFile(this.filePath, 'utf-8', (err, lastConfigText) => {
			if (err) {
				if (err.code === 'ENOENT') {
                    // 配置文件没找到，通过 callback 返回 undefined.
					// file not found, return undefined by callback.
					callback();
				} else {
					callback(err);
				}
				return;
			}

			if (lastConfigText === '') {
                // 配置文件是空的，通过 callback 返回 undefined.
				// config file content is empty, return undefined by callback.
				callback();
				return;
			}

            // 当配置文件内容有错误时，JSON.parse 方法会抛出 SyntaxError 异常
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
            let config = JSON.parse(lastConfigText);

            callback(null, config);
        });
    }

    save(config, callback) {
        let configText = JSON.stringify(config);
        fs.writeFile(this.filePath, configText, 'utf-8', (err) => {
            if (err) {
				callback(err);
				return;
			}

			callback();
        });
    }

    static get extensionName() {
        return '.json';
    }
}

module.exports = JSONConfigFile;