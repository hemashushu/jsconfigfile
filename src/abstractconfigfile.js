const ObjectUtils = require('jsobjectutils');

/**
 * 文件型配置
 */
class AbstractConfigFile {

    constructor(filePath) {
        this.filePath = filePath;
    }

    /**
     * 加载配置
     *
     * 如果配置文件内容有错误，会通过 callback 返回 SyntaxError 异常。
     *
     * @param {*} callback 返回 (err, config)，其中 config 可能是
     *     一个纯数据对象，或者是一个纯数据数组。如果文件不存在或者文件
     *     内容是空的，则 config 的值为 undefined.
     */
    load(callback) {
        //
    }

    /**
     * 保存配置
     *
     * - 配置中属性值为 undefined 的条目的值会被替换为 null。
     * - 对于有默认值的配置文件，config 应该先移除默认值。
     * - 调用此方法时，需确认文件路径（file path）当中的目录（file directory）
     *   已经存在，否则会抛出异常。
     *
     * @param {*} config 纯数据对象或者纯数据数组
     * @param {*} callback 返回 (err)
     */
    save(config, callback) {
        //
    }

    /**
     * 更新配置
     *
     * - 调用此方法时，需确认文件路径（file path）当中的目录（file directory）
     *   已经存在，否则会抛出异常。
     *
     * @param {*} partialConfig 由需更新的配置条目构成的对象，该对象将会
     *     跟配置文件已存在的条目进行合并，然后写入配置文件。
     *     - 对于有默认值的配置文件，partialConfig 应该先移除默认值。
     *     - 如果想删除某个配置项，可以添加一个值为 undefined 的属性。
     *     - partialConfig 必须是一个纯数据对象，不能是数组（Array），否则
     *       会抛出 TypeError 异常。
     * @param {*} callback 返回 (err, mergedConfig)，其中 mergedConfig
     *     为已合并的配置对象，即写入配置文件的对象。
     */
    update(partialConfig, callback) {
        if (!ObjectUtils.isObject(partialConfig)) {
            callback(new TypeError('partialConfig should be a pure data object.'));
            return;
        }

        // 空对象
        if (ObjectUtils.isEmpty(partialConfig)) {
            callback(null, partialConfig);
            return;
        }

        this.load((err, lastConfig) => {
            if (err) {
                if (err instanceof SyntaxError) {
                    //
                } else {
                    callback(err);
                    return;
                }
            }

            // 检查已存在的配置
            if (lastConfig !== undefined) {
                if (ObjectUtils.objectEquals(partialConfig, lastConfig)) {
                    // 已存在的配置跟 partialConfig 相同，不用更新。
                    callback(null, partialConfig);
                    return;
                }
            }

            // 合并配置对象
            let mergedConfig;
            if (lastConfig === undefined) {
                mergedConfig = partialConfig;
            } else {
                mergedConfig = ObjectUtils.objectMerge(partialConfig, lastConfig);
            }

            this.save(mergedConfig, (err) => {
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

module.exports = AbstractConfigFile;