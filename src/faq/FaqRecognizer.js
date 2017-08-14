const _ = require('lodash');
const { EventEmitter } = require('events');
const { QnAClient } = require('./QnAClient');

class FaqRecognizer extends EventEmitter {

    constructor({ client, intentThreshold }) {
        super();

        this.client = client;
        this.intentThreshold = intentThreshold;
    };

    recognize(context, callback) {

        const result = { score: 0.0, intent: null };

        if (context && context.message && context.message.text) {
            let textClean = context.message.text.replace(/(\r\n|\n|\r)/gm, " ");

            this.client.getAnswer(textClean, 3).then(answers => {

                // map intents to botbuilder format
                result.intents = answers.map(i => ({ intent: "faq", score: i.score }));

                const top = answers.sort((a, b) => a.score - b.score)[answers.length - 1];

                //filter intents with less than intentThreshold
                result.score = (top.score / 100) < this.intentThreshold ? 0 : (top.score / 100);
                result.intent = "faq";

                //Add intent and score to message object
                context.message.intent = result.intent;
                context.message.score = result.score;
                context.message.answer = top.answer;

                this.emit('onRecognize', context);
                callback(null, result);
            });
        }
        else {
            callback(null, result);
        }
    };
}

module.exports.FaqRecognizer = FaqRecognizer;