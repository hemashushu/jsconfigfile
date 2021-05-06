const AbstractConfigFile = require('./abstractconfigfile');

class YAMLConfigFile extends AbstractConfigFile {
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

            try{
                // 当配置文件内容有错误时，jsyaml.safeLoad 会抛出
                // YAMLException 异常，跟 JSON.parse 会抛出 SyntaxError 异常类似。
                // 为了统一、方便起见，这里把 YAMLException 捕捉并重新抛出 SyntaxError。
				let config = jsyaml.safeLoad(lastConfigText);
                callback(null, config);

            }catch(e) {
				callback(new SyntaxError('Invalid YAML file content.'));
			}
        });
    }

    save(obj) {
        // jsyaml.safeDump (object [ , options ])
        //
		// Serializes object as a YAML document. Uses DEFAULT_SAFE_SCHEMA, so it
		// will throw an exception if you try to dump regexps or functions. However,
		// you can disable exceptions by setting the skipInvalid option to true.
		//
		// https://github.com/nodeca/js-yaml#safedump-object---options-

		let options = {
			skipInvalid: true
		};

        // jsyaml.safeDump 方法类似 JSON.stringify 方法。
		let configText = jsyaml.safeDump(config, options);

        fs.writeFile(this.filePath, configText, 'utf-8', (err) => {
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

module.exports = YAMLConfigFile;