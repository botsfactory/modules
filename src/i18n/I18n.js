const builder = require('botbuilder');
const _ = require('lodash');

const localesMap =
    {
        en: { id: 'en', name: 'English', success: "Language changed succesfully!", error: "Error changing language, please try again." },
        es: { id: 'es', name: 'Español', success: "Idioma cambiado exitosamente!!", error: "Error al cambiar el lenguage, intenta de nuevo." }
    }

class I18n {

    constructor(config = { bot: null, locales: null }) {

        this.config = config;
        this.supportedLocales = config.locales.map(l => l.id);
    }

    installDialogs() {

        // set the dialog itself.
        this.config.bot.dialog('/changeLanguage',
            [
                (session, args) => {

                    let choices = this.config.locales.map(l => l.name);

                    builder.Prompts.choice(session, "Select language/Elige idioma", choices)
                },
                (session, result) => {

                    const locale = _.filter(localesMap, l => l.name == result.response.entity)[0]
                    const user = session.message.user;

                    session.message.user.locale = locale.id;

                    session.message.user.save()
                        .then(() => {

                            session.preferredLocale(session.message.user.locale, function (err) {

                                session.endDialog(locale.success);
                            });
                        })
                        .catch(err => {

                            session.error(new Error(locale.error))
                        })
                }
            ]).triggerAction({ matches: /\/changeLanguage/ })
    }

    installMiddleWare() {

        this.config.bot.use(
            {
                botbuilder: (session, next) => {

                    if (session.preferredLocale() != session.message.user.locale) {

                        session.preferredLocale(session.message.user.locale, function (err) {

                            next();
                        });
                    } else {
                        next();
                    }
                }
            })
    }
}

module.exports.I18n = I18n;
module.exports.localesMap = localesMap;