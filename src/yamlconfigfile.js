const fs = require('fs');
const jsyaml = require('js-yaml');
const {ParseException} = require('jsexception');

const AbstractFileConfig = require('./abstractfileconfig');

class YAMLFileConfig extends AbstractFileConfig {

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

            try{
                // 当配置文件内容有错误时，jsyaml.load 会抛出 YAMLException 异常，
                // 跟 JSON.parse 会抛出 SyntaxError 异常类似。
                // 为了统一、方便起见，这里把 YAMLException 捕捉并重新抛出 ParseException。
				let config = jsyaml.load(lastConfigText);
                callback(null, config);

            }catch(e) {
                callback(new ParseException('Cannot parse YAML config file content.', e));
			}
        });
    }

    save(filePath, config, callback) {
		let options = {
			skipInvalid: true
		};

        // jsyaml.dump 方法类似 JSON.stringify 方法。
		let configText = jsyaml.dump(config, options);

        fs.writeFile(filePath, configText, 'utf-8', (err) => {
            if (err) {
				callback(err);
				return;
			}

			callback();
        });
    }

    static get extensionName() {
        return '.yaml';
    }
}

module.exports = YAMLFileConfig;