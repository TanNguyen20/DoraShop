const express = require('express');
const Account = require('../models/account');
const Order = require('../models/order');
const {mongooseToObject, mulMgToObject} = require('../../util/mongo');
const jwt = require('jsonwebtoken');
var md5 = require('md5');
const { ObjectId } = require('bson');
class UsersController{
    cancelorder(req, res, next){
        var idOrder = req.body.idOrder;
        Order.findOne({_id:idOrder})
        .then(data=>{
            if(data.status==0) {
                Order.updateOne({_id:idOrder},{status:-2})
                .then(()=>{
                    res.send('1');
                })
                .catch(err=>{
                    res.send('Có lỗi xảy ra khi update order trong cancelorder, thử lại sau');
                })
            }
            else if(data.status==1){
                Order.updateOne({_id:idOrder},{status:-1})
                .then(()=>{
                    res.send('-1');
                })
                .catch(err=>{
                    res.send('Có lỗi xảy ra khi update order trong cancelorder, thử lại sau');
                })
            }
        })
        .catch(()=>{
            res.send('Có lỗi xảy ra khi tìm order trong cancel order, thử lại sau');
        })
    }
    myorders(req , res, next){
        var token = req.cookies.token;
        if(token){
            var form =req.body;
            var result = jwt.verify(token,'mk');
            if(result){
                Account.findOne({_id: result._id})
                .populate('cart._id')
                .populate('myorders._id')
                .then(data=>{
                    var myorderarray =[];
                    var myorderdetail=[];
                    var image = [];
                    for(var i=0;i<data.myorders.length;i++){

                        if(data.myorders[i]._id!=null){
                            if(data.myorders[i]._id.status==0){
                                myorderarray.push({list:data.myorders[i]._id.orderdetail,buytime: data.myorders[i]._id.createdAt.toString().split('GMT+0700 (Indochina Time)')[0]});
                                myorderdetail.push(data.myorders[i]);
                            }
                        }
                    }
                    // res.json(myorderarray);
                    res.render('myorder-status0',{
                        myorder:myorderarray,
                        account: mongooseToObject(data),
                        accountname: data.username,
                        cart:data.cart,
                        myorderdetail,
                    });
                })
            }
        }
        else{
            res.redirect('/user/Login');
        }
    }
    myordersstatus1(req , res, next){
        var token = req.cookies.token;
        if(token){
            var form =req.body;
            var result = jwt.verify(token,'mk');
            if(result){
                Account.findOne({_id: result._id})
                .populate('cart._id')
                .populate('myorders._id')
                .then(data=>{
                    var myorderarray =[];
                    var myorderdetail=[];
                    for(var i=0;i<data.myorders.length;i++){
                        if(data.myorders[i]._id!=null){
                            if(data.myorders[i]._id.status==1 || data.myorders[i]._id.status==-1){
                                myorderarray.push({list:data.myorders[i]._id.orderdetail,Status:data.myorders[i]._id.status,buytime: data.myorders[i]._id.createdAt.toString().split('GMT+0700 (Indochina Time)')[0]});
                                myorderdetail.push(data.myorders[i]);
                            }
                        }
                    }
                    res.render('myorder-status1',{
                        myorder:myorderarray,
                        account: mongooseToObject(data),
                        accountname: data.username,
                        cart:data.cart,
                        myorderdetail,
                    });
                })
            }
        }
        else{
            res.redirect('/user/Login');
        }
    }
    myordersstatus2(req , res, next){
        var token = req.cookies.token;
        if(token){
            var form =req.body;
            var result = jwt.verify(token,'mk');
            if(result){
                Account.findOne({_id: result._id})
                .populate('cart._id')
                .populate('myorders._id')
                .then(data=>{
                    var myorderarray =[];
                    for(var i=0;i<data.myorders.length;i++){
                        if(data.myorders[i]._id!=null){
                            if(data.myorders[i]._id.status==2){
                                myorderarray.push({list:data.myorders[i]._id.orderdetail,buytime: data.myorders[i]._id.createdAt.toString().split('GMT+0700 (Indochina Time)')[0]});
                            }
                        }
                    }
                    res.render('myorder-status2',{
                        myorder:myorderarray,
                        account: mongooseToObject(data),
                        accountname: data.username,
                        cart:data.cart,
                        myorderdetail: mongooseToObject(data.myorders),
                    });
                })
            }
        }
        else{
            res.redirect('/user/Login');
        }
    }
    password(req, res, next){
        var token = req.cookies.token;
        if(token){
            var result = jwt.verify(token,'mk');
            if(result){
                Account.findOne({_id: result._id})
                .populate('cart._id')
                .then((data)=>{
                    res.render('password',{
                        account: mongooseToObject(data),
                        accountname: data.username,
                        cart:data.cart,
                    });
                })
                
            }
            else{
                res.redirect('/user/Login');
            }
        }
       else{
           res.redirect('/user/Login');
       }
        
    }
    changepassword(req, res, next){
        var token = req.cookies.token;
        if(token){
            var result = jwt.verify(token,'mk');
            if(result){
                Account.updateOne({_id: result._id},{password: md5(req.body.newpassword)})
                .then((data)=>{
                    res.redirect('/');
                })
                .catch(err=>{
                    res.json('Có lỗi xảy ra trong khi cập nhật mật khẩu, thử lại sau!!!');
                })
            }
            else{
                res.redirect('/user/Login');
            }
        }

        else{
            res.redirect('/user/Login');
        }
    }
    information(req, res, next){
        
        var token = req.cookies.token;
        if(token){
            var form =req.body;
            var result = jwt.verify(token,'mk');
            if(result){
                Account.findOne({_id: result._id})
                .populate('cart._id')
                .then((data)=>{
                    res.render('customerinformation',{
                        account:mongooseToObject(data),
                        accountname: data.username,
                        cart:data.cart,
                    });
                })
                .catch(err=>{
                    res.json('Có lỗi xảy ra khi tìm account trong trang information');
                })
            }
            else{
                res.json('/user/Login');
            }
        }

        else{
            res.redirect('user/Login');
        }
    }
    changeaddress(req, res, next){
        var token = req.cookies.token;
        if(token){
            var form =req.body;
            var require;
            if(form.require) require = form.require;
            if(!require) require='Không có yêu cầu';
            var result = jwt.verify(token,'mk');
            if(result){
                Account.updateOne({_id: result._id},{customername: form.customername,address:form.address,phonenumber:form.phonenumber,require})
                .then((data)=>{
                    res.redirect('back');
                })
                .catch(err=>{
                    res.json('Có lỗi xảy ra trong khi cập nhật');
                })
            }
            else{
                res.redirect('/user/Login');
            }
        }
        else{
            res.redirect('/user/Login');
        }
    }
    order(req, res, next){
        var orderCart = [];//san pham trong gio hang dat mua
        var orderInformation ={};//thong tin mua hang hoan chinh
        var token = req.cookies.token;
        var form = req.body;
        if(token){
            var result = jwt.verify(token,'mk');
            if(result){// da dang nhap
                if(req.body.choosen=='default'){//dia chi mac dinh
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then((data)=>{
                        var cart = data.cart;
                        var temp ={};//luu tam 1 san pham sau do them vao aray orderCart
                        
                        for(var it =0 ;it< cart.length;it++){
                            temp['nameproduct'] = cart[it]._id.name;
                            temp['imageproduct'] = cart[it]._id.image;
                            temp['pricesproduct'] = cart[it]._id.prices;
                            temp['amountproduct'] = Number(form.amountProduct[it]);
                            if(cart.length==1) temp['color'] = form.productcolor;
                            else temp['color'] = form.productcolor[it];
                            orderCart.push(temp);
                            temp={};
                        }
                        
                        orderInformation['orderdetail'] = orderCart;
                        orderInformation['customername'] = data.customername;
                        orderInformation['address'] = data.address;
                        orderInformation['phonenumber'] = data.phonenumber;
                        orderInformation['require'] = data.require;
                        //neu mau chua co trong db khi them se bi loi do mau co truong required
                        const order = new Order(orderInformation);
                        order.save()
                        .then( () =>{
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
                        })
                        .catch(error =>{
                            res.json({message: 'Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng cho bạn'})
                        });
                    })
                }
                else{//dia chi moi
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then((data)=>{
                        var cart = data.cart;
                        var temp ={};//luu tam 1 san pham sau do them vao aray orderCart
                        for(var it =0 ;it< cart.length;it++){
                            temp['nameproduct'] = cart[it]._id.name;
                            temp['imageproduct'] = cart[it]._id.image;
                            temp['pricesproduct'] = cart[it]._id.prices;
                            temp['amountproduct'] = Number(form.amountProduct[it]);
                            if(cart.length==1) temp['color'] = form.productcolor;
                            else temp['color'] = form.productcolor[it];
                            orderCart.push(temp);
                            temp={};
                        }
                        
                        orderInformation['orderdetail'] = orderCart;
                        orderInformation['customername'] = form.customername;
                        orderInformation['address'] = form.address;
                        orderInformation['phonenumber'] = form.phonenumber;
                        if(form.require) orderInformation['require'] = form.require;
                        //neu mau chua co trong db khi them se bi loi do mau co truong required
                        // const order = new Order(orderInformation);
                        // order.save()
                        // .then( () =>{
                        //     Account.updateOne({_id: result._id},{cart: []})
                        //     .then( () =>{
                        //         res.redirect('/');
                        //     })
                        //     .catch(()=>{
                        //         res.redirect('/');
                        //     })
                        //     res.redirect('/');
                        // })
                        // .catch(error =>{
                        //     res.json({message: 'Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng cho bạn'})
                        // });
                        //neu mau chua co trong db khi them se bi loi do mau co truong required
                        const order = new Order(orderInformation);
                        order.save()
                        .then( () =>{
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
                        })
                        .catch(error =>{
                            res.json({message: 'Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng cho bạn'})
                        });
                    })
                }
            }
            else{
                //neu chua dang nhap
                //khach hang mua ngay
            }
        }
        else{
            //neu chua dang nhap
            //khach hang mua ngay
        }
        // res.json(req.body);
        
    }
    login(req, res, next) {
        res.render('Login');
    }
    logout(req, res, next){
        res.clearCookie('token');
        res.clearCookie('userid');
        res.redirect('/');
    }
    register(req, res, next) {
        res.render('Register');
    }
    //check khi dang ki
    checkusername(req, res, next){
        const formData = req.body;
        var checkUsername = formData.checkUsername;
        Account.findOne({ username: checkUsername})
        .then(data => {
            if(data){
                res.send("Tài khoản này đã tồn tại");
            }
            else{
                res.send("1");
            }
            
        })
        .catch(error => {
            res.send("Có lỗi xảy ra khi kiểm tra tên tài khoản");
        })
    }
    //check khi doi mat khau
    checkpassword(req, res, next){
        const formData = req.body;
        var checkPassword = formData.checkPassword;
        var token = req.cookies.token;
        if(token){
            var result = jwt.verify(token,'mk');
            Account.findOne({ _id: result,password: md5(checkPassword) })
            .then(data => {
                if(data){
                    res.send("1");
                }
                else{
                    res.send("Không phải là mật khẩu hiện tại");
                }
                
            })
            .catch(error => {
                res.send("Có lỗi xảy ra khi kiểm tra mật khẩu");
            })
        }
    }
    //check thong tin dia chi co ton tai khong
    checkinformation(req, res, next){
        var token = req.cookies.token;
        if(token){
            var result = jwt.verify(token,'mk');
            if(result){
                Account.findOne({_id: result._id})
                .then((data)=>{
                    if(data.customername!='') res.send('1');
                    else  res.send('Chưa có địa chỉ mặc định');
                })
                .catch(err=>{
                    res.json('Có lỗi xảy ra khi tìm account');
                })
            }
            else{
                res.json('Bạn chưa đăng nhập, đăng nhập để tiếp tục');
            }
        }

        else{
            res.json('Bạn chưa đăng nhập, đăng nhập để tiếp tục');
        }
    }
    //
    createaccount(req, res, next) {
        const formData = req.body;
        formData.password = md5(formData.password);
        const account = new Account(formData);
        account.save()
            .then( () =>res.redirect('/user/Login'))
            .catch(error =>{
                res.json('Có lỗi xảy ra khi đăng kí vui lòng thử lại sau!!!');
        });
    }
    privateUser(req, res, next){
        res.render('private');
    }
    testtoken(req, res, next){
        try {
            var token = req.cookies.token;
            var result = jwt.verify(token,'mk');// result tra ve chinh la _id duoc truyen vao luc tao token
            var decoded = jwt.decode(token, {complete: true});//co the dung result o tren cung duoc 
            
            if(result){
                var decoded = jwt.decode(token, {complete: true});
                Account.findOne({ _id: result._id })
                .then(account =>{
                    res.render('private',{accountname: account.username});
                })
                .catch(err =>{
                    res.json('Không tìm thấy tài khoan đi kèm token này');
                })

            }
            else{
                res.redirect('/user/Login');
            
            }
        } catch (error) {
            return res.json('Can phai login de xem');
        }
    }
    authentication(req, res , next){
        const formData = req.body;
        var username = formData.username;
        var password = md5(formData.password);
        Account.findOne({
            username: username, 
            password: password,
        })
        .then(data =>{
            if(data){
               jwt.sign({_id: data._id},'mk',{ expiresIn: '1h' },(err, token) =>{
                    res.cookie('token',token,{maxAge: 3600000});
                    res.cookie('userid',data._id,{maxAge: 3600000});
                    //chuyen sang trang admin neu dung la admin
                    if(data.username=='admin') res.redirect('/me/stored/product');
                    else res.redirect('/');
               });
                
            }
            else{
                return res.send('<p>Đăng nhập thất bại</p><a style="text-decoration:none" href="/user/Login">Về trang đăng nhập</a>');
            }
        })
        .catch(err =>{
            res.status(500).json('loi server');
        })
    }
   
}

module.exports = new UsersController();