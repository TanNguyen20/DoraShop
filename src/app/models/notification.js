const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const notificationSchema = new Schema({
    from: { type: String,required: true, },
    to: { type: String,required: true, },
    typeNotification: { type: String, required: true,},
}, {
    collection: 'notification',
    timestamps: true,
});

module.exports =  mongoose.model('notification',notificationSchema);