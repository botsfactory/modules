const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    connieId: String,
    name: String,
    firstName: String,
    lastName: String,
    addresses: { facebook: Object, emulator: Object },
    facebookPageScopedProfile: Object,
    blocked: { type: Boolean, default: false },
    locale: { type: String, enum: ['en', 'es', 'default'], default: 'default'},
    custom: { type: Object, default: {} },
    updated: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now }
});

module.exports.DefaultUserSchema = schema;