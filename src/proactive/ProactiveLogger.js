class ProactiveLogger {

    constructor(id, db) {

        this.id = id;
        this.db = db;
    }

    log(what) {

        what.timestamp = Date.now()

        this.db
            .collection(this.id)
            .insertOne(what)
    }

    exists(query) {
        return this.db.collection(this.id).find(query).limit(1).next().then(data => !!data)
    }

    last(query) {

        return this.db.collection(this.id).find(query).sort({ timestamp: -1 }).limit(1).next()
    }

}

module.exports.ProactiveLogger = ProactiveLogger;