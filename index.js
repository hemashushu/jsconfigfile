const AbstractFileConfig = require('./src/abstractfileconfig');
const PromiseFileConfig = require('./src/promisefileconfig');
const JSONFileConfig = require('./src/jsonfileconfig');
const YAMLFileConfig = require('./src/yamlconfigfile');
const LocaleProperty = require('./src/localeproperty');

module.exports = {
    AbstractFileConfig: AbstractFileConfig,
    PromiseFileConfig: PromiseFileConfig,
    JSONFileConfig: JSONFileConfig,
    LocaleProperty: LocaleProperty,
    YAMLFileConfig: YAMLFileConfig
};