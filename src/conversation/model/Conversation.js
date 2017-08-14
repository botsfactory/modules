const { Message } = require('botbuilder');

class Conversation {

    constructor() {

        this.conversationId = null
        this.messages = null
        this.custom = null;
    }
}

class ConnieMessage extends Message {

    constructor() {
        super()

        this.sender = null;
        this.intent = null;
        this.score = null;
    }
}

module.exports.Conversation = Conversation;
module.exports.ConnieMessage = ConnieMessage;