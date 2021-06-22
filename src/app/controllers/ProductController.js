const Product = require('../models/product');
const {mongooseToObject} = require('../../util/mongo');
const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const Order = require('../models/order');
const History = require('../models/historyfind');
const {mulMgToObject} = require('../../util/mongo');
class ProductController{
    addtocart(req, res, next){
        res.json('da them');
    }
    order(req, res,next){
        var productslug =req.params.productslug;
        // res.json(productslug);
        // res.render('product/order');
        Product.findOne({slug: productslug})
            .then(product=>{
                // Neu co du lieu trong database thi hien thi khong thi chuyen huong nguoi dung ve trang home
                if(product!=null) {
                    var token = req.cookies.token;
                    if(token){
                        var result = jwt.verify(token,'mk');
                        Account.findOne({ _id: result })
                        .populate('cart._id')
                        .then(data=>{
                            // res.json(data.cart);
                            History.findOne({_id: result._id})
                            .then(his=>{
                                var arrayHistory = [];
                                if(his){
                                    if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                    else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                                }
                                
                                res.render('product/order',{
                                    product: mongooseToObject(product),
                                    account: mongooseToObject(data),
                                    accountname: data.username,
                                    historydata: arrayHistory,
                                    cart:data.cart,
                                });
                            })
                           .catch(()=>{
                               res.json('Có lỗi xảy ra khi tìm lịch sử');
                           })
                        }).catch(()=>{
                            res.redirect('/');
                        })
                    }
                    else{
                        res.render('product/order',{
                            product: mongooseToObject(product),
                        });
                    }
                    
                }
                else res.redirect('/');
            })
            .catch(next);
        
    }
    processorder(req, res,next){
        var form = req.body;
        var productslug = req.params.productslug;
        Product.findOne({_id: productslug})
        .then(product=>{
            if(product!=null) {
                //san pham trong gio hang dat mua
                var orderCart = [{nameproduct: product.name, amountproduct: Number(form.amountProduct), color: form.productcolor, pricesproduct: product.prices,imageproduct:product.image}];
                var orderInformation ={};//thong tin mua hang hoan chinh
                orderInformation['orderdetail'] = orderCart;
                orderInformation['customername'] = form.customername;
                orderInformation['address'] = form.address;
                orderInformation['phonenumber'] = form.phonenumber;
                if(form.require) orderInformation['require'] = form.require;
                const order = new Order(orderInformation);
                // res.json(order);
                order.save()
                .then(() =>{
                    var token = req.cookies.token;
                    var result;
                    if(token){
                        result = jwt.verify(token,'mk');
                        // res.json(order);
                        if(result){
                            Account.findOne({_id: result._id})
                            .then((acc)=>{
                                var myorders = [];
                                myorders = acc.myorders;
                                myorders[myorders.length]={_id: order._id};
                                Account.updateOne({_id: result._id},{cart: [], myorders})
                                .then( () =>{
                                    res.redirect('/');
                                })
                                .catch(()=>{
                                    res.redirect('/');
                                })
                            })
                        }
                    }
                    else{
                        res.redirect('/');
                    }
                    
                })
                .catch(error =>{
                    res.json({message: 'Có lỗi xảy ra khi mua, vui lòng thử lại sau'});
                });
            }
            else res.redirect('/');
        })
        .catch(()=>{
            res.redirect('/');
        });
        
    }
    //hien thi trang chi tiet san phan
    show(req, res,next){
        Product.findOne({slug: req.params.slug})
            .then(product=>{
                // Neu co du lieu trong database thi hien thi khong thi chuyen huong nguoi dung ve trang home
                if(product!=null){
                    var token = req.cookies.token;
                    if(token){
                        var result = jwt.verify(token,'mk');
                        Account.findOne({ _id: result._id })
                        .populate('cart._id')
                        .then(account =>{
                            History.findOne({_id: result._id})
                            .then(his=>{
                                var arrayHistory = [];
                                if(his){
                                    if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                    else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                                }
                                res.render('product/show',{
                                    product: mongooseToObject(product),
                                    historydata:arrayHistory,
                                    accountname: account.username,
                                    cart: account.cart,
                                })
                            })
                        })
                        .catch(err =>{
                            
                        });
                    }
                    else{
                        //can sua lai, hien tai chi gan cart bang chuoi rong
                        res.render('product/show',{
                            product: mongooseToObject(product),
                        })
                    }
                }
                else res.redirect('/');
            })
            .catch(next);
        
    }
    create(req, res,next){
       res.render('product/create');
    }
    // luu tru product cho create.handlebars thong qua action=/course/store
    store(req, res , next){
        const formData = req.body;
        //dinh dang mau san pham
        let colorArray =req.body.color.split(",");
        let colorArrayFormated = [];
        colorArray.forEach(value =>{
            colorArrayFormated.push(value.trim());
        })
        //gan lai sau khi dinh dang
        
        formData.color=colorArrayFormated;
        //them vao database
        const product = new Product(formData);
        product.save()
            .then( () =>res.redirect('/me/stored/product'))
            .catch(error =>{
                res.json({message: 'Có lỗi xảy ra khi thêm sản phẩm trong store, thử lại sau!!!'})
            });
    }
    // /product/:id/edit
    edit(req, res,next){
        Product.findById(req.params.id)
            .then(product =>res.render('product/edit',{
                product: mongooseToObject(product),
            }))
            .catch(next);
     }
    // PUT /product/:id
    update(req, res, next ){
        //dinh dang mau san pham
        var formData = req.body;
        let colorArray =req.body.color.split(",");
        let colorArrayFormated = [];
        colorArray.forEach(value =>{
            colorArrayFormated.push(value.trim());
        })
        //gan lai sau khi dinh dang
        
        formData.color=colorArrayFormated;
        Product.updateOne({_id: req.params.id},formData)
            .then(()=> res.redirect('/me/stored/product'))
            .catch(next);
    }
    //  DELETE /course/:id soft delete
    delete(req, res, next){
        Product.delete({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    //DELETE /course/:id/destroy destroy delete
    destroy(req, res, next){
        Product.deleteOne({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    //restore PATCH
    restore(req, res, next){
        Product.restore({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    // xu li trong form store va form trash POST
    handleFormActions(req, res, next){
        switch(req.body.action){
            case 'delete':
                Product.delete({_id: {$in: req.body.courseIds}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            case 'destroy':
                // res.json(req.body.courseIds);
                Product.deleteMany({_id: {$in: req.body.courseIds}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            case 'restore':
                Product.restore({_id: {$in: req.body.courseIds}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            default: res.json({message: 'Action is invalid!'});
        }
    }
}
module.exports = new ProductController();