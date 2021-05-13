const fs = require('fs');
const tmp = require('tmp');
const path = require('path');

const { ObjectUtils } = require('jsobjectutils');
const assert = require('assert/strict');

const YAMLFileConfig = require('../src/yamlconfigfile');
const PromiseFileConfig = require('../src/promisefileconfig');

describe('Promise File Config Test', () => {
    it('Test load()', (done) => {
        let configFilePath = path.join(__dirname, 'resources', 'sample.yaml');
        let fileConfig = new YAMLFileConfig();
        let promiseFileConfig = new PromiseFileConfig(fileConfig);

        promiseFileConfig.load(configFilePath)
            .then(config => {
                assert.equal(config.id, 123);
                assert.equal(config.name, 'foo');
                assert.equal(config.text, 'hello');
                assert.equal(config.enabled, true);

                let addrObject = config.addr;
                assert.equal(addrObject.city, 'sz');
                assert.equal(addrObject.postcode, '518000');
                assert(ObjectUtils.arrayEquals(addrObject.street, ['line1', 'line2']));

                done();
            })
            .catch(err => {
                assert.fail(err.message);
            });
    });

    it('Test loadWithResolvePlaceholder()', (done) => {
        let configFilePath = path.join(__dirname, 'resources', 'sample.yaml');
        let fileConfig = new YAMLFileConfig();
        let promiseFileConfig = new PromiseFileConfig(fileConfig);

        let contextObject = {
            locale: {
                category: '类别',
                title: '标题'
            }
        };

        promiseFileConfig.loadWithResolvePlaceholder(configFilePath, contextObject)
            .then(config => {
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
            })
            .catch(err => {
                assert.fail(err.message);
            });
    });

    it('Test loadWithPreprocess()', (done) => {
        let configFilePath = path.join(__dirname, 'resources', 'sample.yaml');
        let fileConfig = new YAMLFileConfig();
        let promiseFileConfig = new PromiseFileConfig(fileConfig);

        let preprocessFunc = (text) => {
            return 'name1: "value1"\nname2: "value2"';
        };

        promiseFileConfig.loadWithPreprocess(configFilePath, preprocessFunc)
            .then(config => {
                let keys = Object.keys(config);
                assert(!keys.includes('id'));
                assert(!keys.includes('name'));
                assert(!keys.includes('text'));
                assert(!keys.includes('enabled'));
                assert(!keys.includes('category'));
                assert(!keys.includes('title'));
                assert(!keys.includes('addr'));

                assert.equal(config.name1, 'value1');
                assert.equal(config.name2, 'value2');

                done();
            })
            .catch(err => {
                assert.fail(err.message);
            });
    });

    it('Test save()', (done) => {
        let fileConfig = new YAMLFileConfig();
        let promiseFileConfig = new PromiseFileConfig(fileConfig);

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

            promiseFileConfig.save(tempFilePath, config)
                .then(() => promiseFileConfig.load(tempFilePath))
                .then(lastConfig => {
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
                })
                .catch(err => {
                    assert.fail(err.message);
                });

        });
    });

    it('Test update()', (done) => {
        let fileConfig = new YAMLFileConfig();
        let promiseFileConfig = new PromiseFileConfig(fileConfig);

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

            promiseFileConfig.save(tempFilePath, config)
                .then(() => {
                    let partialConfig = {
                        name: 'bar',
                        checked: true, // new property
                        addr: {
                            city: 'gz',
                            street: ['line1', 'line2']
                        }
                    };

                    return promiseFileConfig.update(tempFilePath, partialConfig);
                })
                .then(mergedConfig => promiseFileConfig.load(tempFilePath))
                .then(lastConfig => {
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

    it('Test updateByFile()', (done) => {
        let configFilePath = path.join(__dirname, 'resources', 'sample.yaml');
        let fileConfig = new YAMLFileConfig();
        let promiseFileConfig = new PromiseFileConfig(fileConfig);

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

            promiseFileConfig.save(tempFilePath, config)
                .then(() => promiseFileConfig.updateByFile(tempFilePath, configFilePath))
                .then(() => promiseFileConfig.load(tempFilePath))
                .then(lastConfig => {
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
                })
                .catch(err => {
                    assert.fail(err.message);
                });

        });
    });

});

