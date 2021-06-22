const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');

const accountSchema = new Schema({
    username: String,
    password: String,
    permissions:{type: Number, default: 1},
    // cart co kieu la [](array) va moi phan tu trong cart thi co truong _id va amount
    //voi _id la ref de lien ket toi Product
    //khi populate thi phai lay thong qua cart._id boi vi ref la _id
    cart:[{_id:{type:ObjectId, ref:Product}, amount:Number}],
    customername:{type: String, default:""},
    address:{type: String, default:""},
    phonenumber:{type:String, default:""},
    require: {type: String, default:""},
    myorders:[{_id:{type:ObjectId, ref:Order}}],
}, {
    collection: 'account',
    timestamps: true,
});
mongoose.plugin(slug);

module.exports =  mongoose.model('account',accountSchema);