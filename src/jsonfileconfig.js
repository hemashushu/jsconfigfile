const fs = require('fs');
const { ParseException, FileNotFoundException, IOException } = require('jsexception');

const AbstractFileConfig = require('./abstractfileconfig');

class JSONFileConfig extends AbstractFileConfig {
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

            // 当配置文件内容有错误时，JSON.parse 方法会抛出 SyntaxError 异常
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
            try {
                let resolvedText = preprocessFunc(lastConfigText);
                let config = JSON.parse(resolvedText);
                callback(null, config);

            } catch (e) {
                callback(new ParseException(
                    `Can not parse the content of JSON config file: ${filePath}`, e));
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