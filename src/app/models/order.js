const mongoose = require('mongoose');
const Product = require('../models/product');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Account = require('../models/account');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const orderSchema = new Schema({
    customername:{type: String, required:true},
    address:{type: String, required:true},
    phonenumber:{type:String, required:true},
    require: {type: String, default: 'Không có yêu cầu'},
    status: {type: Number, default:0},
    orderdetail:[{
        nameproduct:{type: String, required:true}, 
        imageproduct:{type: String, required:true},
        pricesproduct:{type: Number, required:true},
        color:{type: String, required:true},
        amountproduct:{type: Number, required:true},
    }],
},{
    collection: 'order',
    timestamps: true,
    setDefaultsOnInsert: true,
});
mongoose.plugin(slug);
orderSchema.plugin(mongooseDelete,{
    deletedAt : true,
    overrideMethods: 'all'});
module.exports =  mongoose.model('order',orderSchema);
// voi order chinh la ten collection trong db
//neu order khong co thi tao moi voi cac luat nhu tren(trong orderSchema)