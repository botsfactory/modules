const request = require('request-promise-native');
const _ = require('lazy.js');
const lodash = require('lodash');

class QnAClient {

    constructor({ knowledgeBaseId, subscriptionKey }) {

        this.KNOWLEDGE_BASE_ID = knowledgeBaseId;
        this.SUBSCRIPTION_KEY = subscriptionKey;

        this.url_base = `https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/${this.KNOWLEDGE_BASE_ID}`;
    }

    getAnswer(question, top) {
        const result = [];
        return request.post({
            url: this.url_base + '/generateAnswer',
            headers: { 'Ocp-Apim-Subscription-Key': this.SUBSCRIPTION_KEY, 'Content-Type': 'application/json' },
            body: `{
                "question": "${question}",
                "top": "${top}"
            }`
        })
        .then(res => JSON.parse(res))
        .then(res => res.answers);
    }
}


module.exports.QnAClient = QnAClient;