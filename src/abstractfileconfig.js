const ObjectUtils = require('jsobjectutils');

/**
 * 文件型配置
 */
class AbstractFileConfig {

    /**
     * 加载配置
     *
     * 如果配置文件内容有（语法）错误而无法解析，会通过 callback
     * 返回 SyntaxError 异常。
     *
     * @param {*} filePath
     * @param {*} callback 返回 (err, config)，其中 config 可能是
     *     一个纯数据对象，或者是一个纯数据数组。如果文件不存在或者文件
     *     内容是空的，则 config 的值为 undefined.
     */
    load(filePath, callback) {
        //
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
     * @param {*} callback 返回 (err)
     */
    save(filePath, config, callback) {
        //
    }

    /**
     * 更新配置。
     *
     * - 只更新 partialConfig 存在的条目，对于源配置已经存在，但 partialConfig 不
     *   存在的条目，将会保持不变。
     * - 无法使用该方法删除已存在的条目。
     * - 调用此方法时，需确认文件路径（filePath）当中的目录（file directory）
     *   已经存在，否则会抛出异常。
     * - 如果配置文件内容有错误，会通过 callback 返回 SyntaxError 异常。
     *
     * @param {*} filePath
     * @param {*} partialConfig 由需更新的配置条目构成的对象，该对象将会
     *     跟配置文件已存在的条目进行合并，然后写入配置文件。
     *     - 对于使用 “默认值配置”+“用户配置” 策略的应用程序，建议在更新
     *       配置之前先移除默认值。
     *     - 如果 partialConfig 某项的值为 undefined，则不会更新源配置的该项。
     *     - partialConfig 必须是一个纯数据对象，不能是数组（Array），否则
     *       会抛出 TypeError 异常。
     * @param {*} callback 返回 (err, mergedConfig)，其中 mergedConfig
     *     为已合并的配置对象，即最终的配置文件的对象。
     */
    update(filePath, partialConfig, callback) {
        if (!ObjectUtils.isObject(partialConfig)) {
            callback(new TypeError('partialConfig should be a pure data object.'));
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
     * 通过另一个配置文件来更新配置文件。
     *
     * 只更新参考配置文件存在的条目，对于源配置已经存在，但参考配置不
     * 存在的条目，将会保持不变。
     *
     * - 如果配置文件内容有错误，会通过 callback 返回 SyntaxError 异常。
     *
     * @param {*} filePath
     * @param {*} sourceFilePath
     * @param {*} callback 返回 (err, mergedConfig)，其中 mergedConfig
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