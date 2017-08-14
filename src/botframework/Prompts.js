const { Session, CardAction, Message, Keyboard } = require('botbuilder');
const builder = require('botbuilder');

class Prompts {

}

Prompts.optionalKeyboardCard = function (session, suggestions, message) {

    const buttons = suggestions.map(s => s.toAction ? s.toAction() : CardAction.imBack(session, s, s))
    const msg = new Message()

    if (message) {
        const prompt = session.localizer.gettext(session.preferredLocale(), message)
        msg.text(prompt)
    }

    msg.attachments([new Keyboard(session).buttons(buttons)])

    session.send(msg)
}

Prompts.optionalHeroCard = (session, message, suggestions) => {

    const prompt = session.localizer.gettext(session.preferredLocale(), message || "help")
    const buttons = suggestions.map(s => CardAction.imBack(session, s, s))

    const msg = new Message()
    msg.text(prompt)

    msg.attachments([new builder.HeroCard(session).buttons(buttons).toAttachment()])

    session.send(msg)
}


module.exports.Prompts = Prompts;