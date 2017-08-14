const { Facebook } = require('./Facebook');
const { FacebookApi } = require('./FacebookApi')

module.exports.install = function (bot, server, config) {

    const facebook = new Facebook({bot, server, config});

    return facebook;
}

module.exports.Facebook = Facebook;
module.exports.FacebookApi = FacebookApi;