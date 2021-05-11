const fs = require('fs');
const {ParseException} = require('jsexception');

const AbstractFileConfig = require('./abstractfileconfig');

class JSONFileConfig extends AbstractFileConfig {
    load(filePath, callback) {
        fs.readFile(filePath, 'utf-8', (err, lastConfigText) => {
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
            try{
                let config = JSON.parse(lastConfigText);
                callback(null, config);

            }catch(e) {
                callback(new ParseException('Cannot parse JSON config file content.', e));
            }

        });
    }

    save(filePath, config, callback) {
        let configText = JSON.stringify(config);
        fs.writeFile(filePath, configText, 'utf-8', (err) => {
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

module.exports = JSONFileConfig;