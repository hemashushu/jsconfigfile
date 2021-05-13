const { ObjectUtils } = require('jsobjectutils');
const assert = require('assert/strict');

const LocaleProperty = require('../src/localeproperty');

describe('Locale Property Test', () => {
    it('Test getValue()', () => {
        let c = {
            'Comment[en_GB]': 'Edit text files',
            'Comment[zh_CN]': '编辑文本文件',
            'Comment[zh_HK]': '編輯文字檔',
            'Comment[zh]': '编辑文本档案',
            'Comment[ja]': 'テキストファイルを編集します',
            'Comment': 'Edit text files'
        };

        let v1 = LocaleProperty.getValue(c, 'Comment', 'zh_CN');
        assert.equal(v1, '编辑文本文件');

        let v2 = LocaleProperty.getValue(c, 'Comment', 'zh_HK');
        assert.equal(v2, '編輯文字檔');

        // 尝试模糊匹配（单匹配 language code）
        let v3 = LocaleProperty.getValue(c, 'Comment', 'zh_SG');
        assert.equal(v3, '编辑文本档案');

        let v4 = LocaleProperty.getValue(c, 'Comment', 'zh');
        assert.equal(v4, '编辑文本档案');

        let v5 = LocaleProperty.getValue(c, 'Comment', 'fr');
        assert.equal(v5, 'Edit text files');

        // try passing the 'zh-CN' (instead of 'zh_CN') to parameter 'localeCode'.
        let v6 = LocaleProperty.getValue(c, 'Comment', 'zh-CN');
        assert.equal(v6, '编辑文本文件');
    });

    it('Test setValue()', () => {
        let c = {};

        LocaleProperty.setValue(c, 'Comment', 'zh_CN', '编辑文本文件');
        assert(ObjectUtils.objectEquals(c, {
            'Comment[zh_CN]': '编辑文本文件'
        }));

        LocaleProperty.setValue(c, 'Comment', 'zh_HK', '編輯文字檔');
        assert(ObjectUtils.objectEquals(c, {
            'Comment[zh_CN]': '编辑文本文件',
            'Comment[zh_HK]': '編輯文字檔'
        }));
    });
});