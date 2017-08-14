const { ConnieMessage, Conversation }  = require('./model/Conversation');

module.exports.install = (bot, db, recognizer) => {

    recognizer.on('onRecognize', onRecognize);
    let collection = db.collection('conversations');
    collection.createIndex({ conversationId: 1 });

    bot.use(
        {
            receive: (event, next) => {
                onReceive(event, collection);
                next();
            },
            send: (event, next) => {
                onSend(event, collection);
                next();
            }
        });

    function onRecognize(data) {
        collection.update({ 'messages.text': data.message.text, 'conversationId': data.message.address.conversation.id },
            { $set: { 'messages.$.intent': data.message.intent, 'messages.$.score': data.message.score } });
    }
}

module.exports.installGeneric = (bot, db) => {

    let collection = db.collection('conversations');
    collection.createIndex({ conversationId: 1 });

    bot.use(
        {
            receive: (event, next) => {
                onReceive(event, collection);
                next();
            },
            send: (event, next) => {
                onSend(event, collection);
                next();
            }
        });
}

function onReceive(event, collection) {

    if (event.type == "message") {
        let conversation = new Conversation();
        conversation.conversationId = event.address.conversation.id;
        let message = new ConnieMessage();
        message = event;
        message.address = event.address;
        message.sender = "user";

        collection.findOneAndUpdate({ "conversationId": conversation.conversationId },
            { $push: { "messages": message } }, { upsert: true });
    }
}

function onSend(event, collection) {

    if (event.type == "message") {
        let conversation = new Conversation();
        conversation.conversationId = event.address.conversation.id;
        let message = new ConnieMessage();
        message = event;
        message.address = event.address;
        message.sender = "bot";

        collection.findOneAndUpdate({ "conversationId": conversation.conversationId },
            { $push: { "messages": message } }, { upsert: true });
    }
}