const { UsersApi } = require('./../users');
const { I18n, localesMap } = require('./I18n')

module.exports.install = (bot, db, config) => {

    //TODO: learn to use the spread operator :D
    config.bot = bot;
    config.db = db;

    const i18n = new I18n(config);

    i18n.installDialogs();
    i18n.installMiddleWare();

    return i18n;
}

module.exports.localesMap = localesMap;