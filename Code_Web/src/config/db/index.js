const mongoose = require('mongoose');
async function connect(){
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/quan_ly', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        console.log("Ket noi thanh cong !!!")
    }
    catch(error){
        console.log("Ket noi khong thanh cong !!!")
    }
}
module.exports ={ connect };