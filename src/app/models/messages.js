const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const messagesSchema = new Schema({
    from: { type: String,required: true, },
    to: { type: String,required: true, },
    content: { type: String, required: true,},
}, {
    collection: 'messages',
    timestamps: true,
});

module.exports =  mongoose.model('messages',messagesSchema);