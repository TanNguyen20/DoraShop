module.exports ={
    mulMgToObject: function(mongoosearrays){
        return mongoosearrays.map(mongoosearray=>mongoosearray.toObject());
    },
    mongooseToObject: function(mongoose){
        return mongoose ? mongoose.toObject() : mongoose;
    }
}