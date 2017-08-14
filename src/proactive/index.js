
const { Proactive } = require('./Proactive');
const { ProactiveLogger } = require('./ProactiveLogger');

module.exports.install = (bot, db, server) => {

    const proactive = new Proactive({ bot, db, server });

    proactive.install();

    return proactive;
}

module.exports.Proactive = Proactive;
module.exports.ProactiveLogger = ProactiveLogger;