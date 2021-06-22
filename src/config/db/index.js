const mongoose = require('mongoose');
async function connect(){
    try{
        // await mongoose.connect('mongodb://127.0.0.1:27017/quan_ly', {
        await mongoose.connect('mongodb+srv://quanly:KgqntHXNLR3w1FgF@cluster0.onmys.mongodb.net/nienluan?retryWrites=true&w=majority', {
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