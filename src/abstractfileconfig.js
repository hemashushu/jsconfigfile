const { ObjectUtils } = require('jsobjectutils');
const { StringUtils } = require('jsstringutils');
const { IllegalArgumentException } = require('jsexception');

/**
 * 文件型配置
 */
class AbstractFileConfig {

    /**
     * 加载配置
     *
     * - 如果配置文件内容有错误（如语法错误，数据格式错误等）而无法解析，会通过 callback
     *   返回 ParseException 异常。
     * - 如果文件找不到，会通过 callback 返回 FileNotFound 异常。
     * - 如果出现其他 IO 错误，会通过 callback 返回 IOException 对象。
     *
     * @param {*} filePath
     * @param {*} callback (err, config)，其中 config 可能是纯数据对象。
     *     - 本模块不支持内容为非数据对象的配置文件，比如内容是一个数组或者一个字符串这种；
     *     - 当文件内容是空时，返回一个空数据对象：{}
     *     - 当文件无实际内容时，比如只有注释，返回一个空数据对象：{}
     */
    load(filePath, callback) {
        let preprocessFunc = (text) => {
            return text;
        };

        this.loadWithPreprocess(filePath, preprocessFunc, (err, lastConfig) => {
            if (err) {
                callback(err);
                return;
            }

            callback(null, lastConfig);
        });
    }

    loadWithResolvePlaceholder(filePath, contextObject, callback) {
        let preprocessFunc = (text) => {
            return StringUtils.resolvePlaceholderByContextObject(text, contextObject);
        };

        this.loadWithPreprocess(filePath, preprocessFunc, (err, lastConfig) => {
            if (err) {
                callback(err);
                return;
            }

            callback(null, lastConfig);
        });
    }

    /**
     * 带文本预处理的配置加载方法
     *
     *
     * @param {*} filePath
     * @param {*} preprocessFunc 文本预处理方法，该方法允许在解析配置文件的文本
     *     之前，先作一些预处理，比如解析文本当中的占位符等。方法的签名为：
     *     function preprocessFunc(text) {
     *         return 'new text';
     *     }
     *     其中 'text' 为文件的原始文本，有可能为空字符串。
     * @param {*} callback
     */
    loadWithPreprocess(filePath, preprocessFunc, callback) {
        // 待子类实现
    }

    /**
     * 保存配置
     *
     * - 配置中属性值为 undefined 的条目的值会被替换为 null。
     * - 当使用 JSON 格式储存配置时，Date 类型会被转换为字符串，从 JSON 文件读取
     *   配置之后需要手动转换为 Date 类型。
     * - 对于使用 “默认值配置”+“用户配置” 策略的应用程序，建议在保存
     *   配置（config）之前先移除默认值（可以使用
     *   ObjectUtils.removePropertiesByKeyValues 方法），以减小配置文件的大小。
     * - 调用此方法时，需确认文件路径（filePath）当中的目录（file directory）
     *   已经存在，否则会抛出异常。
     *
     * @param {*} filePath
     * @param {*} config 纯数据对象或者纯数据数组
     * @param {*} callback (err)
     */
    save(filePath, config, callback) {
        // 待子类实现
    }

    /**
     * 更新配置。
     *
     * - 无法使用该方法删除已存在的条目。
     * - 调用此方法时，需确认文件路径（filePath）当中的目录（file directory）
     *   已经存在，否则会抛出异常。
     * - 如果配置文件内容有错误，会通过 callback 返回 ParseException 异常。
     *
     * @param {*} filePath
     * @param {*} partialConfig 由需更新的配置条目构成的对象，该对象将会
     *     跟配置文件已存在的条目进行合并，然后写入配置文件。
     *     - partialConfig 存储的是需要更新的条目，而不是配置文件的完整内容。
     *       比如当调用者只想更新某项值时，partialConfig 只需放置该项的 key name 和 key value。
     *     - 对于源配置文件已存在的，但 partialConfig 里没有出现的项目，其值将保持不变。
     *     - 对于使用 “默认值配置”+“用户配置” 策略的应用程序，建议在更新
     *       配置之前先移除默认值。
     *     - 如果 partialConfig 某项的值为 undefined，则不会更新源配置的该项。
     *     - partialConfig 必须是一个纯数据对象，不能是数组（Array），否则
     *       会抛出 TypeError 异常。
     * @param {*} callback (err, mergedConfig)，其中 mergedConfig
     *     为已合并的配置对象，即最终的配置文件的对象。
     */
    update(filePath, partialConfig, callback) {
        if (!ObjectUtils.isObject(partialConfig)) {
            callback(new IllegalArgumentException('partialConfig should be a pure data object.'));
            return;
        }

        this.load(filePath, (err, lastConfig) => {
            if (err) {
                callback(err);
                return;
            }

            // 合并配置对象
            let mergedConfig;
            if (lastConfig === undefined) {
                // 源配置文件为空
                mergedConfig = partialConfig;

            } else {
                if (ObjectUtils.objectEquals(partialConfig, lastConfig)) {
                    // 已存在的配置跟 partialConfig 相同，跳过更新。
                    callback(null, lastConfig);
                    return;
                }

                mergedConfig = ObjectUtils.objectMerge(partialConfig, lastConfig);

                if (ObjectUtils.objectEquals(mergedConfig, lastConfig)) {
                    // 合并后的配置跟已存在的配置相同，跳过更新。
                    callback(null, lastConfig);
                    return;
                }
            }

            this.save(filePath, mergedConfig, (err) => {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, mergedConfig);
            });
        });
    }

    /**
     * 通过另一个配置文件（参考配置文件）来更新配置文件。
     *
     * 参考配置文件的内容是待更新的条目，而不必是完整的配置内容。
     * 对于源配置文件已存在的，而参考配置不存在的条目，将会保持不变。
     *
     * - 如果配置文件内容有错误，无论是参考配置文件，还是目标配置文件，
     *   都会通过 callback 返回 ParseException 异常。
     *
     * @param {*} filePath
     * @param {*} sourceFilePath
     * @param {*} callback (err, mergedConfig)，其中 mergedConfig
     *     为已合并的配置对象，即最终的配置文件的对象。
     */
    updateByFile(filePath, sourceFilePath, callback) {
        this.load(sourceFilePath, (err, lastConfig) => {
            if (err) {
                callback(err);
                return;
            }

            if (lastConfig === undefined) {
                lastConfig = {};
            }

            this.update(filePath, lastConfig, (err, mergedConfig) => {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, mergedConfig);
            });
        });
    }

    static get extensionName() {
        return '.config';
    }
}

module.exports = AbstractFileConfig;