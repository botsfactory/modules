const { FaqRecognizer } = require('./FaqRecognizer');
const { QnAClient } = require('./QnAClient');
const { Application } = require('express');
const { TextUtils } = require('../botframework');
const entities = require('entities');

module.exports.install = function ({ bot, server, intents, knowledgeBaseId, subscriptionKey, intentThreshold }) {

    //  setup QnA client
    const qnaClient = new QnAClient({ knowledgeBaseId: knowledgeBaseId, subscriptionKey: subscriptionKey });

    //create recognizer
    const faqRecognizer = new FaqRecognizer({ client: qnaClient, intentThreshold: intentThreshold });

    //install recognizer
    intents.recognizer(faqRecognizer);

    //add dialog for Faq
    intents.matches('faq', '/faq');

    bot.dialog(`/faq`,
        [
            (session) => {
                const clearText = entities.decodeXML(session.message.answer);
                const messages = TextUtils.split(clearText, 640);
                messages.forEach(function (text, index) {
                    session.send(text);
                });
                session.endConversation();
            }
        ]);
}
