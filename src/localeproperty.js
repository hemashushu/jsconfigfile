/**
 * 读取或写入具有本地化文本字段的配置文件
 *
 * 比如：
 * ---
 * Comment[en_GB]=Edit text files               ... #1
 * Comment[zh_CN]=编辑文本文件                   ... #2
 * Comment[zh_TW]=編輯文字檔                     ... #3
 * Comment[ja]=テキストファイルを編集します        ... #4
 * Comment=Edit text files                      ... #5
 * ---
 *
 * 本地化文本字段的组成格式为：
 *
 * "字段名" + "[" + localCode + "]" + "=" = 值
 *
 * 其中 localCode 为诸如 'zh_CN', 'en_US', 'jp' 等 Locale ID (LCID)。
 *
 * 读取示例：
 * 当读取 "Comment" 字段的文本时：
 * 如果 localeCode 为 zh_CN，则读取第 2 行的文本
 * 如果 localeCode 为 kr，因为找不到相应的 localeCode，所以读取默认的（即第 5 行）文本。
 */
class LocaleProperty {

    /**
     * 读取字段
     *
     * @param {*} config
     * @param {*} propertyName
     * @param {*} localeCode
     * @returns
     */
    static getValue(config, propertyName, localeCode) {

        // 将传入的 LCID 中间的连接符号统一转换为 '_'，比如 'en-US' 将会
        // 转为 'en_US'
        localeCode = localeCode.replace('-', '_');

        // 尝试准确匹配
        let localePropertyName = `${propertyName}[${localeCode}]`;
        let value = config[localePropertyName];
        if (value !== undefined) {
            return value;
        }

        // 尝试只匹配 language code
        let pos = localeCode.indexOf('_');
        if (pos > 0) {
            let languageCode = localeCode.substring(0, pos);
            let languagePropertyName = `${propertyName}[${languageCode}]`;
            value = config[languagePropertyName];
            if (value !== undefined) {
                return value;
            }
        }

        return config[propertyName];
    }

    /**
     * 写入字段
     *
     * @param {*} config
     * @param {*} propertyName
     * @param {*} localeCode
     * @param {*} value 当 value 为 undefined 时，相应的字段会被删除
     */
    static setValue(config, propertyName, localeCode, value) {
        // 将传入的 LCID 中间的连接符号统一转换为 '_'，比如 'en-US' 将会
        // 转为 'en_US'
        localeCode = localeCode.replace('-', '_');

        let localePropertyName = `${propertyName}[${localeCode}]`;

        if (value === undefined) {
            delete config[localePropertyName];
        }else {
            config[localePropertyName] = value;
        }
    }
}

module.exports = LocaleProperty;