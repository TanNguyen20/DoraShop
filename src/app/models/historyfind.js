const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Account = require('../models/account');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const historyfindSchema = new Schema({
    _id:{type: ObjectId,ref:Account},
    historycontent: [],
}, {
    collection: 'history',
    timestamps: true,
});

mongoose.plugin(slug);
historyfindSchema.plugin(mongooseDelete,{
    deletedAt : true,
    overrideMethods: 'all'});

module.exports =  mongoose.model('history',historyfindSchema);