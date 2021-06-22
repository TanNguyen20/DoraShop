const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const Course = new Schema({
    name: { type: String, default: 'nguyen van a',required: true, },
    discription: { type: String, default: 'day la mo ta' },
    image: { type: String, default: 'day la duong dan' },
    videoId: { type: String, default: 'ID cua video',required: true, },
    level: { type: String, default: 'Cap do' },
    slug: { type: String, slug: 'name', unique: true },
}, {
    timestamps: true,
});
module.exports =  mongoose.model('Course',Course);