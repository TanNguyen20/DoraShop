const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const productSchema = new Schema({
    name: { type: String, default: 'ten san pham',required: true, },
    prices: { type: Number, default:0 },
    image: { type: String, required: true },
    slug: { type: String, slug: 'name', unique: true },
    color:{type:Array },
    typeProduct:{type: String,required:true}

    /*  slug ben trai co the thay bang bat ki chu gi vi no la key 
        trong 1 document cua collection courses 
        slug ben phai chinh la const slug = require('mongoose-slug-generator');
    */
}, {
    collection: 'product',
    timestamps: true,
});

mongoose.plugin(slug);
productSchema.plugin(mongooseDelete,{
    deletedAt : true,
    overrideMethods: 'all'});

module.exports =  mongoose.model('product',productSchema);