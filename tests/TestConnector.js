class TestConnector {

    onEvent(handler) {

        this.onEventHandler = handler;
    }

    send(session, callback) {

        console.log('Default send, should be overwriten');
    }

    receiveMessage(msg) {

        this.onEventHandler([msg.toMessage()]);
    }
}

module.exports.TestConnector = TestConnector;