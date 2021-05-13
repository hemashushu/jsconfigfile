const AbstractFileConfig = require('./src/abstractfileconfig');
const JSONFileConfig = require('./src/jsonfileconfig');
const LocaleProperty = require('./src/localeproperty');
const PromiseFileConfig = require('./src/promisefileconfig');
const TOMLFileConfig = require('./src/tomlconfigfile');
const YAMLFileConfig = require('./src/yamlconfigfile');

module.exports = {
    AbstractFileConfig: AbstractFileConfig,
    JSONFileConfig: JSONFileConfig,
    LocaleProperty: LocaleProperty,
    PromiseFileConfig: PromiseFileConfig,
    TOMLFileConfig: TOMLFileConfig,
    YAMLFileConfig: YAMLFileConfig
};