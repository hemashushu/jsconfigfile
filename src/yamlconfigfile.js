const fs = require('fs');
const jsyaml = require('js-yaml');
const { ParseException, FileNotFoundException, IOException } = require('jsexception');

const AbstractFileConfig = require('./abstractfileconfig');

class YAMLFileConfig extends AbstractFileConfig {

    loadWithPreprocess(filePath, preprocessFunc, callback) {
        fs.readFile(filePath, 'utf-8', (err, lastConfigText) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // 配置文件没找到
                    callback(new FileNotFoundException(
                        `Can not find the specified file: ${filePath}`));
                } else {
                    callback(new IOException(
                        `Can not open the specified file: ${filePath}`, err));
                }
                return;
            }

            // 去除前后空格
            lastConfigText = lastConfigText.trim();

            if (lastConfigText === '') {
                // 配置文件是空的，通过 callback 返回 {}.
                // config file content is empty, return {} by callback.
                callback(null, {});
                return;
            }

            try {
                let resolvedText = preprocessFunc(lastConfigText);

                // 当配置文件内容有错误时，jsyaml.load 会抛出 YAMLException 异常，
                // 跟 JSON.parse 会抛出 SyntaxError 异常类似。
                // 为了统一、方便起见，这里把 YAMLException 捕捉并重新抛出 ParseException。
                let config = jsyaml.load(resolvedText);

                if (config === null) {
                    // YAML 对无实质内容的配置文件，比如只有注释的，会返回 null
                    // 统一起见，这里转换为空对象 {}
                    config = {};
                }

                callback(null, config);

            } catch (e) {
                callback(new ParseException(
                    `Can not parse the content of YAML config file: ${filePath}`, e));
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