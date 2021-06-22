//day la file test database dau tien, không dùng 
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const Course = new Schema({
    name: { type: String, default: 'nguyen van a',required: true, },
    discription: { type: String, default: 'day la mo ta' },
    image: { type: String, default: 'day la duong dan' },
    videoId: { type: String, default: 'ID cua video',required: true, },
    level: { type: String, default: 'Cap do' },
    slug: { type: String, slug: 'name', unique: true },
    /*  slug ben trai co the thay bang bat ki chu gi vi no la key 
        trong 1 document cua collection courses 
        slug ben phai chinh la const slug = require('mongoose-slug-generator');
    */
}, {
    timestamps: true,
});

mongoose.plugin(slug);
Course.plugin(mongooseDelete,{
    deletedAt : true,
    overrideMethods: 'all'});

module.exports =  mongoose.model('Course',Course);
/*  Course mau cam se duoc chuyen thanh chu thuong sau do them s vao 
    => courses -> chinh la collection trong database neu courses
    khong co trong database cua mongodb thi collection nay se duoc tao ra 
    vi du ta thay Course bang Course5 thi trong database khong co nen
    collection nay se duoc tao ra
*/