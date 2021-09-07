const fs = require('fs');
const tmp = require('tmp');
const path = require('path');

const { ObjectUtils } = require('jsobjectutils');
const assert = require('assert/strict');

const { JSONFileConfig,
    YAMLFileConfig,
    TOMLFileConfig } = require('../index');

let testLoad = (filePath, fileConfig, done) => {
    fileConfig.load(filePath, (err, config) => {
        if (err) {
            assert.fail(err.message);
            return;
        }

        assert.equal(config.id, 123);
        assert.equal(config.name, 'foo');
        assert.equal(config.text, 'hello');
        assert.equal(config.enabled, true);
        assert.equal(config.category, '${locale.category}');
        assert.equal(config.title, '${locale.title}');

        let addrObject = config.addr;
        assert.equal(addrObject.city, 'sz');
        assert.equal(addrObject.postcode, '518000');
        assert(ObjectUtils.arrayEquals(addrObject.street, ['line1', 'line2']));

        done();
    });
};

let testLoadWithResolvePlaceholder = (filePath, fileConfig, done) => {
    let contextObject = {
        locale: {
            category: '类别',
            title: '标题'
        }
    };

    fileConfig.loadWithResolvePlaceholder(filePath, contextObject, (err, config) => {
        if (err) {
            assert.fail(err.message);
            return;
        }

        assert.equal(config.id, 123);
        assert.equal(config.name, 'foo');
        assert.equal(config.text, 'hello');
        assert.equal(config.enabled, true);
        assert.equal(config.category, '类别');
        assert.equal(config.title, '标题');

        let addrObject = config.addr;
        assert.equal(addrObject.city, 'sz');
        assert.equal(addrObject.postcode, '518000');
        assert(ObjectUtils.arrayEquals(addrObject.street, ['line1', 'line2']));

        done();
    });
};

let testSave = (fileConfig, done) => {
    tmp.tmpName((err, tempFilePath) => {
        if (err) {
            assert.fail(err.message);
            return;
        }

        let config = {
            id: 123,
            name: 'foo',
            creationTime: new Date(1),
            addr: {
                city: 'sz'
            },
            scores: [1, 2, 3]
        };

        fileConfig.save(tempFilePath, config, (err) => {
            if (err) {
                assert.fail(err.message);
                return;
            }

            fileConfig.load(tempFilePath, (err, lastConfig) => {
                if (err) {
                    assert.fail(err.message);
                    return;
                }

                // JSON parse can not convert date time string into Date
                let resolvedConfig = ObjectUtils.clone(lastConfig, {
                    creationTime: (oldValue) => {
                        if (oldValue instanceof Date) {
                            return oldValue;
                        } else {
                            // oldValue is a String
                            // convert string into Date: new Date(Date.parse(oldValue))
                            return new Date(oldValue);
                        }
                    }
                });

                assert(ObjectUtils.objectEquals(resolvedConfig, config));

                // delete tmp file
                fs.unlink(tempFilePath, () => {
                    done();
                });
            });
        });
    });
};

let testUpdate = (fileConfig, done) => {
    tmp.tmpName((err, tempFilePath) => {
        if (err) {
            assert.fail(err.message);
            return;
        }

        let config = {
            id: 123,
            name: 'foo',
            addr: {
                city: 'sz',
                postcode: '518000'
            }
        };

        fileConfig.save(tempFilePath, config, (err) => {
            if (err) {
                assert.fail(err.message);
                return;
            }

            let partialConfig = {
                name: 'bar',
                checked: true, // new property
                addr: {
                    city: 'gz',
                    street: ['line1', 'line2']
                }
            };

            fileConfig.update(tempFilePath, partialConfig, (err, mergedConfig) => {
                if (err) {
                    assert.fail(err.message);
                    return;
                }

                // 从文件中读出最新的配置
                fileConfig.load(tempFilePath, (err, lastConfig) => {
                    if (err) {
                        assert.fail(err.message);
                        return;
                    }

                    assert(ObjectUtils.objectEquals(mergedConfig, lastConfig));

                    assert.equal(lastConfig.name, 'bar');
                    assert.equal(lastConfig.checked, true);
                    assert.equal(lastConfig.addr.city, 'gz');
                    assert(ObjectUtils.arrayEquals(lastConfig.addr.street, ['line1', 'line2']));

                    // delete tmp file
                    fs.unlink(tempFilePath, () => {
                        done();
                    });
                });
            });
        });
    });
};

let testUpdateByFile = (sourceFilePath, fileConfig, done) => {
    tmp.tmpName((err, tempFilePath) => {
        if (err) {
            assert.fail(err.message);
            return;
        }

        let config = {
            id: 456,
            name: 'bar',
            addr: {
                city: 'gz',
                postcode: '518000'
            }
        };

        fileConfig.save(tempFilePath, config, (err) => {
            if (err) {
                assert.fail(err.message);
                return;
            }

            fileConfig.updateByFile(tempFilePath, sourceFilePath, (err, mergedConfig) => {
                if (err) {
                    assert.fail(err.message);
                    return;
                }

                // 从文件中读出最新的配置
                fileConfig.load(tempFilePath, (err, lastConfig) => {
                    if (err) {
                        assert.fail(err.message);
                        return;
                    }

                    assert(ObjectUtils.objectEquals(mergedConfig, lastConfig));

                    assert.equal(lastConfig.id, 123);
                    assert.equal(lastConfig.name, 'foo');
                    assert.equal(lastConfig.text, 'hello');
                    assert.equal(lastConfig.enabled, true);
                    assert.equal(lastConfig.addr.city, 'sz');
                    assert(ObjectUtils.arrayEquals(lastConfig.addr.street, ['line1', 'line2']));

                    // delete tmp file
                    fs.unlink(tempFilePath, () => {
                        done();
                    });
                });
            });
        });
    });
};

describe('File config test', () => {

    let items = [
        { name: 'JSON File Config', clazz: JSONFileConfig, fileName: 'sample.json', extensionName: '.json' },
        { name: 'YAML File Config', clazz: YAMLFileConfig, fileName: 'sample.yaml', extensionName: '.yaml' },
        { name: 'TOML File Config', clazz: TOMLFileConfig, fileName: 'sample.toml', extensionName: '.toml' }
    ];

    // https://mochajs.org/#dynamically-generating-tests
    items.forEach(({ name, clazz, fileName, extensionName }) => {
        describe('Test ' + name, () => {
            let configFilePath = path.join(__dirname, 'resources', fileName);
            let fileConfig = Reflect.construct(clazz, []);

            it('Test get extensionName', () => {
                assert.equal(clazz.extensionName, extensionName);
            });

            it('Test load()', (done) => {
                testLoad(configFilePath, fileConfig, done);
            });

            it('Test loadWithResolvePlaceholder()', (done) => {
                testLoadWithResolvePlaceholder(configFilePath, fileConfig, done);
            });

            it('Test save()', (done) => {
                testSave(fileConfig, done);
            });

            it('Test update()', (done) => {
                testUpdate(fileConfig, done);
            });

            it('Test updateByFile()', (done) => {
                testUpdateByFile(configFilePath, fileConfig, done);
            });
        });
    });
});

describe('Empty file config test', () => {
    let items = [
        { clazz: JSONFileConfig, fileName: 'empty-file.json' },
        { clazz: YAMLFileConfig, fileName: 'empty-file.yaml' },
        { clazz: TOMLFileConfig, fileName: 'empty-file.toml' }
    ];

    // https://mochajs.org/#dynamically-generating-tests
    items.forEach(({ clazz, fileName }) => {
        it('Test load file: ' + fileName, (done) => {
            let configFilePath = path.join(__dirname, 'resources', fileName);
            let fileConfig = Reflect.construct(clazz, []);
            fileConfig.load(configFilePath, (err, config) => {
                if (err) {
                    assert.fail(err.message);
                    return;
                }

                assert(ObjectUtils.isEmpty(config));
                done();
            });
        });
    });
});

describe('Empty content config test', () => {
    let items = [
        { clazz: JSONFileConfig, fileName: 'empty-content.json' },
        { clazz: YAMLFileConfig, fileName: 'empty-content.yaml' },
        { clazz: TOMLFileConfig, fileName: 'empty-content.toml' }
    ];

    // https://mochajs.org/#dynamically-generating-tests
    items.forEach(({ clazz, fileName }) => {
        it('Test load file: ' + fileName, (done) => {
            let configFilePath = path.join(__dirname, 'resources', fileName);
            let fileConfig = Reflect.construct(clazz, []);
            fileConfig.load(configFilePath, (err, config) => {
                if (err) {
                    assert.fail(err.message);
                    return;
                }

                assert(ObjectUtils.isEmpty(config));
                done();
            });
        });
    });
});