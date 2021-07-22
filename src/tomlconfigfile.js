const fs = require('fs');
const TOML = require('@iarna/toml');
const { ParseException, FileNotFoundException, IOException } = require('jsexception');

const AbstractFileConfig = require('./abstractfileconfig');

class TOMLFileConfig extends AbstractFileConfig {

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

            if (lastConfigText === '') {
                // 配置文件是空的，通过 callback 返回 undefined.
                // config file content is empty, return undefined by callback.
                callback();
                return;
            }

            try {
                let resolvedText = preprocessFunc(lastConfigText);
                // 当配置文件内容有错误时，TOML.parse 会抛出异常，
                // 跟 JSON.parse 会抛出 SyntaxError 异常类似。
                // 为了统一、方便起见，这里把 TOML.parse 抛出的异常捕捉并重新抛出 ParseException。
                let config = TOML.parse(resolvedText);
                callback(null, config);

            } catch (e) {
                callback(new ParseException(
                    `Can not parse the content of TOML config file: ${filePath}`, e));
            }
        });
    }

    save(filePath, config, callback) {
        // TOML.stringify 方法类似 JSON.stringify 方法。
        let configText = TOML.stringify(config);

        fs.writeFile(filePath, configText, 'utf-8', (err) => {
            if (err) {
                callback(err);
                return;
            }

            callback();
        });
    }

    static get extensionName() {
        return '.toml';
    }
}

module.exports = TOMLFileConfig;