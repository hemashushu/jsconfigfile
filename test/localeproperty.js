const ObjectUtils = require('jsobjectutils');

var assert = require('assert/strict');

const LocaleProperty = require('../src/localeproperty');

describe('Locale Property Test', () => {
    describe('getValue', () => {
        it('Base', () => {
            let c = {
                'Comment[en_GB]': 'Edit text files',
                'Comment[zh_CN]': '编辑文本文件',
                'Comment[zh_TW]': '編輯文字檔',
                'Comment[zh]': '编辑文本档案',
                'Comment[ja]': 'テキストファイルを編集します',
                'Comment': 'Edit text files'
            };

            let v1 = LocaleProperty.getValue(c, 'Comment', 'zh_CN');
            assert.equal(v1, '编辑文本文件');

            let v2 = LocaleProperty.getValue(c, 'Comment', 'zh_TW');
            assert.equal(v2, '編輯文字檔');

            let v3 = LocaleProperty.getValue(c, 'Comment', 'zh_HK');
            assert.equal(v3, '编辑文本档案');

            let v4 = LocaleProperty.getValue(c, 'Comment', 'zh');
            assert.equal(v4, '编辑文本档案');

            let v5 = LocaleProperty.getValue(c, 'Comment', 'fr');
            assert.equal(v5, 'Edit text files');

            // replace 'zh_CN' with 'zh-CN'
            let v6 = LocaleProperty.getValue(c, 'Comment', 'zh-CN');
            assert.equal(v6, '编辑文本文件');
        });

    });
});