const Product = require('../models/product');
const Account = require('../models/account');
const History = require('../models/historyfind');
const {mulMgToObject, mongooseToObject} = require('../../util/mongo');
const jwt = require('jsonwebtoken');//quan trong
const express = require('express');
const { request } = require('express');
class SiteController{
    // test(req, res, next){
    //     res.render('test');
    //     // res.send('noi dung moi');
    // }
    // thu(req, res, next){
    //     console.log(req.body);
    //     res.send('xin chao');
    // }

    //
    sockets(req,res,next){
        res.render('socket');
    }
    //
    addproduct(req, res, next){
        var userid = req.cookies['userid'];
        var productid = req.params.productid;
        if(userid){
            Product.findOne({_id: productid})
            .then((product)=>{
                var _id =product._id;
                var amount =1;//chua co san pham nay trong gio hang thi so luong gan =1
                Account.findOne({_id: userid})
                .then(account=>{
                    var cart = account.cart;
                    var flag =0;//kiem tra san pham nay da ton trai trong gio hang chua
                    var totalAmountProduct = 1;//do khi them thanh cong thi khi load lai trang so luong se tang len them 1
                    for(var i=0; i<cart.length; i++){
                        totalAmountProduct+=cart[i].amount;
                    }
                    for(var i=0; i<cart.length; i++){
                        if(cart[i]._id==productid){
                            cart[i].amount+=1;//san pham da co trong cart nen khi khach add thi tang amount len 1
                            flag=1;
                            break
                        }
                    }
                    //cap nhat san pham da ton tai
                    if(flag==1){
                        Account.updateOne({_id: userid},{cart: cart})
                        .then(() => {
                            totalAmountProduct+="";
                            res.send(totalAmountProduct);
                            // res.redirect('back');
                        })
                    }
                    //them moi 1 san pham vao gio hang
                    else {
                        var elementofcart = {_id, amount};
                        cart.push(elementofcart);
                        Account.updateOne({_id: userid},{cart: cart})
                        .then(() => {
                            totalAmountProduct+="";
                            res.send(totalAmountProduct);
                            // res.redirect('back');
                        })
                    }
                    
                })
                .catch(()=>{
                    res.json('Không tìm thấy account trong addproduct');
                });

            })
            .catch(()=>{
                res.json('Có lỗi khi tìm product tron addproduct, thử lại sau!!!');
            });
        }
        else{
            //chua login gui ve client chuoi 0
            res.send('0');
        }
        
    }
    cart(req, res, next){
        if(req.cookies.token){
            var token = req.cookies.token;
            var result = jwt.verify(token,'mk');
            // res.json(result);
            if(result){
                Account.findOne({ _id: result._id })
                .populate('cart._id')
                .then(account =>{
                    var countHistory =0;
                    History.countDocuments(function (err, count) {
                        if (err){
                            count=0;
                        }
                        countHistory = count;
                    
                        History.findOne({_id: result._id},function(err, data){
                            var arrayHistory=[];
                            if(data){
                                if(data.historycontent.length<=3) arrayHistory=data.historycontent;
                                else arrayHistory=data.historycontent.slice(data.historycontent.length-3,data.historycontent.length);
                            }
                            // res.json(account);
                            // res.json(data.historycontent.slice(data.historycontent.length-3,data.historycontent.length));
                            res.render('cart',{
                                historydata:arrayHistory,
                                accountname: account.username,
                                account: mongooseToObject(account),
                                cart: account.cart,
                            })
                        })
                    });
                })
                .catch(err =>{
                    res.json('Có lỗi khi tìm account trong cart, thử lại sau!!!');
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
    index(req, res, next){
        //do data vao trang home.handlebars
        var countProduct =0;
        var pageindex =Number(req.query.page);
        if(pageindex<1){
            pageindex=1;
        }
        var skipdocument =(pageindex-1)*15;
        Product.countDocuments(function (err, count) {
            if (err){
                count=0;
            }
            countProduct = count;
        });
        
        Product.find({})
            .skip(skipdocument)
            .limit(15)
            .then(product=>{
                var totalpage = Math.ceil(countProduct/15);
                //neu nguoi dung nhap 1 trang lon hon trang lon nhat thi se chuyen ve trang cuoi
                //neu nguoi dung nhap 1 trang nho hon trang nho nhat(trang 1) thi se chuyen ve trang 1
                if(pageindex> totalpage) pageindex = totalpage;
                var nextpage = 1;
                var priviouspage = 1;
                if(pageindex){
                    if(pageindex+1>totalpage) nextpage = totalpage;
                    else nextpage = pageindex +1;
                    if(pageindex-1<1) priviouspage = 1;
                    else priviouspage = pageindex-1;
                }
                res.render('home',{
                    product:mulMgToObject(product),
                    countProduct: totalpage,
                    nextpage,
                    priviouspage,
                })
                
            })
            .catch(next);
    }

    privateUser(req, res, next){
        var token = req.cookies.token;
        var result = jwt.verify(token,'mk');
        
        Account.findOne({ _id: result._id })
        .populate('cart._id')
        .then(account =>{
            var newCart =[];
            for(var i=0;i<account.cart.length;i++){
                if(account.cart[i]._id){
                    newCart.push(account.cart[i]);
                }
            }
            
            var countProduct =0;
            var pageindex =Number(req.query.page);
            if(pageindex<1){
                pageindex=1;
            }
            
            Product.countDocuments(function (err, count) {
                if (err){
                    count=0;
                }
                countProduct = count;
                var totalpage = Math.ceil(countProduct/15);
                //neu nguoi dung nhap 1 trang lon hon trang lon nhat thi se chuyen ve trang cuoi
                //neu nguoi dung nhap 1 trang nho hon trang nho nhat(trang 1) thi se chuyen ve trang 1
                if(pageindex> totalpage) pageindex = totalpage;
                else if(pageindex<1) pageindex =1;
                var skipdocument =(pageindex-1)*15;
                History.findOne({_id: result._id},function(err, data){
                    Product.find({})
                    .skip(skipdocument)
                    .limit(15)
                    .then(product=>{
                        var nextpage = 1;
                        var priviouspage = 1;
                        if(pageindex){
                            if(pageindex+1>totalpage) nextpage = totalpage;
                            else nextpage = pageindex +1;
                            if(pageindex-1<1) priviouspage = 1;
                            else priviouspage = pageindex-1;
                        }
                        //cap nhat lai gio hang khi co san pham bi xoa boi admin
                        account.update({cart: newCart})
                        .then(()=>{
                            var arrayHistory =[];
                            // res.json(data);
                            if(data){
                                if(data.historycontent.length<=3) arrayHistory=data.historycontent;
                                else arrayHistory=data.historycontent.slice(data.historycontent.length-3,data.historycontent.length);
                            }
                            res.render('private',{
                                product:mulMgToObject(product),
                                countProduct: totalpage,
                                nextpage,
                                priviouspage,
                                historydata: arrayHistory,
                                accountname: account.username,
                                cart: newCart,
                            })
                        })
                        
                    })
                    .catch(next);
                })
            });
        })
        .catch(err =>{
            res.json('Có lỗi khi tìm account trong privateuser');
        })
    }
    testtoken(req, res, next){
        
        try {
            var token = req.cookies.token;
            var result = jwt.verify(token,'mk');// result tra ve chinh la _id duoc truyen vao luc tao token
            var decoded = jwt.decode(token, {complete: true});//giong voi bien result o tren
            if(result){
                next();
            }
        } catch (error) {
            var countProduct =0;
            var pageindex =Number(req.query.page);
            if(pageindex<1){
                pageindex=1;
            }
            
            Product.countDocuments(function (err, count) {
                if (err){
                    count=0;
                }
                countProduct = count;
                var totalpage = Math.ceil(countProduct/15);
                //neu nguoi dung nhap 1 trang lon hon trang lon nhat thi se chuyen ve trang cuoi
                //neu nguoi dung nhap 1 trang nho hon trang nho nhat(trang 1) thi se chuyen ve trang 1
                if(pageindex> totalpage) pageindex = totalpage;
                else if(pageindex<1) pageindex =1;
                var skipdocument =(pageindex-1)*15;
                Product.find({})
                .skip(skipdocument)
                .limit(15)
                .then(product=>{
                    var nextpage = 1;
                    var priviouspage = 1;
                    if(pageindex){
                        if(pageindex+1>totalpage) nextpage = totalpage;
                        else nextpage = pageindex +1;
                        if(pageindex-1<1) priviouspage = 1;
                        else priviouspage = pageindex-1;
                    }
                    res.render('home',{
                        product:mulMgToObject(product),
                        countProduct: totalpage,
                        nextpage,
                        priviouspage,
                    })
                    
                })
                .catch(next);
            });
            
            
        }
    }
    
    search(req,res, next){
        var content = req.query.historycontent;
        var token = req.cookies.token;
        if(token){
            var result = jwt.verify(token,'mk');
            if(result){
                const history = new History({_id:result._id,historycontent:[content]});
                history.save()
                    .catch(error =>{
                        History.findOne({_id:result._id})
                        .then(data=>{
                            // res.json('tim thay');
                            var newHistoryArray = data.historycontent;
                            newHistoryArray.push(content);
                            // res.json(newHistoryArray);
                            History.updateOne({_id:result._id},{historycontent:newHistoryArray})
                            .catch(()=>{
                                res.json('Có lỗi khi thêm lịch sử');
                            })
                        })
                        
                });
            }
        }
        
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        //find product with regex duoc nguoi dung nhap vao
        var re = new RegExp(content, "i");
        let productQuery = Product.find({name: re});
        productQuery.countDocuments()
        .then(countProduct=>{
            if(countProduct>0){
                //neu chia ra so nguyen thi giu nguyen nguoc lai so trang =phep chia nguyen cong them 1
                var totalpage = Math.ceil(countProduct/15);
                //neu nguoi dung nhap 1 trang lon hon trang lon nhat thi se chuyen ve trang cuoi
                //neu nguoi dung nhap 1 trang nho hon trang nho nhat(trang 1) thi se chuyen ve trang 1
                if(pageindex> totalpage) pageindex = totalpage;
                else if(pageindex<1) pageindex =1;

                let nextpage, priviouspage;
                if(pageindex+1>totalpage) nextpage = totalpage;
                else nextpage = pageindex +1;
                if(pageindex-1<1) priviouspage = 1;
                else priviouspage = pageindex-1;
                var skipdocument =(pageindex-1)*15;
                var renderproductQuery = Product.find({name: re}).limit(15).skip(skipdocument);
                var token = req.cookies.token;
                var result;
                if(token){
                    result = jwt.verify(token,'mk');
                }
                var accountQuery='';
                var historyQueryFind;
                if(result){
                    historyQueryFind = History.findOne({_id:result._id})
                    accountQuery = Account.findOne({ _id: result._id }).populate('cart._id');
                }
                Promise.all([renderproductQuery,accountQuery,historyQueryFind])
                .then(([product,account,history]) => 
                    {
                        var newCart =[];
                        if(account){
                            for(var i=0;i<account.cart.length;i++){
                                if(account.cart[i]._id){
                                    newCart.push(account.cart[i]);
                                }
                            }
                        }
                        var arrayHistory=[];

                        if(history){
                            if(history.historycontent.length<=3) arrayHistory=history.historycontent;
                            else arrayHistory=history.historycontent.slice(history.historycontent.length-3,history.historycontent.length);
                        }
                       
                        res.render('homesearch',{
                            product: mulMgToObject(product),
                            countProduct:totalpage,
                            nextpage,
                            priviouspage,
                            //truyen lich su ra searchadmin de chuyen trang, next , privious duoc
                            historycontent:content,
                            account: mongooseToObject(account),
                            cart: newCart,
                            accountname: account.username,
                            //khong can countDocuments ma co the lay truc tiep bang slice
                            historydata: arrayHistory,
                        })
                        
                    }
                )
                .catch(next);
            }
            else{
                // res.send('Không tìm thấy sản phẩm');
                res.render('homesearch',{
                    hidden: `display: none;`,
                });
            }
            
        })
        .catch(next);
    }
    //
    searchadmin(req,res, next){
        var content = req.query.historycontent;
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        //find product with regex duoc nguoi dung nhap vao
        var re = new RegExp(content, "i");
        let productQuery = Product.find({name: re});
        let productCountDelete = Product.countDocumentsDeleted();
        productQuery.countDocuments()
        .then(countProduct=>{
            //neu chia ra so nguyen thi giu nguyen nguoc lai so trang =phep chia nguyen cong them 1
            var totalpage = Math.ceil(countProduct/10);
            //neu nguoi dung nhap 1 trang lon hon trang lon nhat thi se chuyen ve trang cuoi
            //neu nguoi dung nhap 1 trang nho hon trang nho nhat(trang 1) thi se chuyen ve trang 1
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;

            let nextpage, priviouspage;
            if(pageindex+1>totalpage) nextpage = totalpage;
            else nextpage = pageindex +1;
            if(pageindex-1<1) priviouspage = 1;
            else priviouspage = pageindex-1;
            var skipdocument =(pageindex-1)*10;
            var renderproductQuery = Product.find({name: re}).limit(10).skip(skipdocument);
            Promise.all([renderproductQuery,productCountDelete])
            .then(([product, countSoftDelete]) => 
                {
                    res.render('searchadmin',{
                        countSoftDelete,
                        product: mulMgToObject(product),
                        countProduct:totalpage,
                        nextpage,
                        priviouspage,
                        //truyen lich su ra searchadmin de chuyen trang, next , privious duoc
                        historycontent:content,
                    })
                    
                }
            )
            .catch(next);
        })
        .catch(next);
    }
    //
    phone(req, res, next){  
        Product.find({typeProduct: 'phone'})
        .then(product=>{
            var countProduct =0;
            var pageindex =Number(req.query.page);
            if(pageindex<1){
                pageindex=1;
            }
            countProduct = product.length;
            var totalpage = Math.ceil(countProduct/15);
            //neu nguoi dung nhap 1 trang lon hon trang lon nhat thi se chuyen ve trang cuoi
            //neu nguoi dung nhap 1 trang nho hon trang nho nhat(trang 1) thi se chuyen ve trang 1
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;
            var skipdocument =(pageindex-1)*15;
            var nextpage = 1;
            var priviouspage = 1;
            var nextpage = 1;
            var priviouspage = 1;
            if(pageindex){
                if(pageindex+1>totalpage) nextpage = totalpage;
                else nextpage = pageindex +1;
                if(pageindex-1<1) priviouspage = 1;
                else priviouspage = pageindex-1;
            }
            Product.find({typeProduct: 'phone'})
            .skip(skipdocument)
            .limit(15)
            .then(product1=>{
                var token = req.cookies.token;
                // res.json(token);
                if(token){
                    
                    var result = jwt.verify(token,'mk');
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then(account=>{
                        History.findOne({_id: result._id})
                        .then(his=>{
                            var arrayHistory = [];
                            if(his){
                                if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                            }
                            
                            // res.json(account.username);
                            // res.json(arrayHistory);
                            res.render('private',{
                                product:mulMgToObject(product1),
                                countProduct: totalpage,
                                accountname: account.username,
                                priviouspage,
                                nextpage,
                                historydata: arrayHistory,
                                cart: account.cart,
                            });
                        })
                        
                    })
                }
                else{
                    res.render('home',{
                        product:mulMgToObject(product1),
                        countProduct: totalpage,
                        priviouspage,
                        nextpage,
                        
                    });
                }
            })
            .catch(()=>{
                res.redirect('/');
            })

        })
        .catch(next);
    }
    laptop(req, res, next){
        Product.find({typeProduct: 'laptop'})
        .then(product=>{
            var countProduct =0;
            var pageindex =Number(req.query.page);
            if(pageindex<1){
                pageindex=1;
            }
            var countProduct = product.length;
            var totalpage = Math.ceil(countProduct/15);
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;
            var skipdocument =(pageindex-1)*15;
            var nextpage = 1;
            var priviouspage = 1;
            if(pageindex){
                if(pageindex+1>totalpage) nextpage = totalpage;
                else nextpage = pageindex +1;
                if(pageindex-1<1) priviouspage = 1;
                else priviouspage = pageindex-1;
            }
            Product.find({typeProduct: 'laptop'})
            .skip(skipdocument)
            .limit(15)
            .then(product1=>{
                var token = req.cookies.token;
                // res.json(token);
                if(token){
                    
                    var result = jwt.verify(token,'mk');
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then(account=>{
                        History.findOne({_id: result._id})
                        .then(his=>{
                            var arrayHistory = [];
                            if(his){
                                if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                            }
                            
                            // res.json(account.username);
                            // res.json(arrayHistory);
                            res.render('private',{
                                product:mulMgToObject(product1),
                                countProduct: totalpage,
                                accountname: account.username,
                                priviouspage,
                                nextpage,
                                historydata: arrayHistory,
                                cart: account.cart,
                            });
                        })
                    })
                }
                else{
                    res.render('home',{
                        product:mulMgToObject(product1),
                        countProduct: totalpage,
                        priviouspage,
                        nextpage,
                        
                    });
                }
            })
            .catch(()=>{
                res.redirect('/');
            })

        })
        .catch(next);
    }
    accessories(req, res, next){
        Product.find({typeProduct: 'accessories'})
        .then(product=>{
            var countProduct =0;
            var pageindex =Number(req.query.page);
            if(pageindex<1){
                pageindex=1;
            }
            var countProduct = product.length;
            var totalpage = Math.ceil(countProduct/15);
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;
            var skipdocument =(pageindex-1)*15;
            var nextpage = 1;
            var priviouspage = 1;
            if(pageindex){
                if(pageindex+1>totalpage) nextpage = totalpage;
                else nextpage = pageindex +1;
                if(pageindex-1<1) priviouspage = 1;
                else priviouspage = pageindex-1;
            }
            Product.find({typeProduct: 'accessories'})
            .skip(skipdocument)
            .limit(15)
            .then(product1=>{
                var token = req.cookies.token;
                // res.json(token);
                if(token){
                    
                    var result = jwt.verify(token,'mk');
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then(account=>{
                        History.findOne({_id: result._id})
                        .then(his=>{
                            var arrayHistory = [];
                            if(his){
                                if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                            }
                            
                            // res.json(account.username);
                            // res.json(arrayHistory);
                            res.render('private',{
                                product:mulMgToObject(product1),
                                countProduct: totalpage,
                                accountname: account.username,
                                priviouspage,
                                nextpage,
                                historydata: arrayHistory,
                                cart: account.cart,
                            });
                        })
                    })
                }
                else{
                    res.render('home',{
                        product:mulMgToObject(product1),
                        countProduct: totalpage,
                        priviouspage,
                        nextpage,
                        
                    });
                }
            })
            .catch(()=>{
                res.redirect('/');
            })

        })
        .catch(next);
    }
    sortprice(req, res, next){
        var numsort=parseInt(req.body.pricessort);
        if(numsort===0) res.redirect('/');
        else{
            Product.find({})
            .sort({ prices: numsort })
            .then(product=>{
                var token = req.cookies.token;
                // res.json(token);
                if(token){
                    var result = jwt.verify(token,'mk');
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then(account=>{
                        History.findOne({_id: result._id})
                        .then(his=>{
                            var arrayHistory = [];
                            if(his){
                                if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                            }
                            
                            // res.json(account.username);
                            // res.json(arrayHistory);
                            res.render('private',{
                                product:mulMgToObject(product),
                                accountname: account.username,
                                historydata: arrayHistory,
                                cart: account.cart,
                            });
                        })
                    })
                }
                else{
                    res.render('home',{
                        product:mulMgToObject(product),
                    })
                }
                

            })
            .catch(next);
        }
    }
    
    sortname(req, res, next){
        var numsortname ;
        if(req.body.sortname) numsortname = parseInt(req.body.sortname);
        else numsortname=1;
        Product.find({})
        .sort({ name: numsortname })
        .then(product=>{
            if(numsortname===1) numsortname=-1;
            else numsortname =1;
            var token = req.cookies.token;
                // res.json(token);
                if(token){
                    var result = jwt.verify(token,'mk');
                    Account.findOne({_id: result._id})
                    .populate('cart._id')
                    .then(account=>{
                        History.findOne({_id: result._id})
                        .then(his=>{
                            var arrayHistory = [];
                            if(his){
                                if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                                else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                            }
                            
                            // res.json(account.username);
                            // res.json(arrayHistory);
                            res.render('private',{
                                product:mulMgToObject(product),
                                accountname: account.username,
                                historydata: arrayHistory,
                                cart: account.cart,
                                numsortname,
                            });
                        })
                    })
                }
                else{
                    res.render('home',{
                        product:mulMgToObject(product),
                        numsortname,
                    })
                }
        })
        .catch(next);
    }
    latest(req, res, next){
        Product.find({})
        .sort({ createdAt: -1 })
        .then(product=>{
            var token = req.cookies.token;
            // res.json(token);
            if(token){
                var result = jwt.verify(token,'mk');
                Account.findOne({_id: result._id})
                .populate('cart._id')
                .then(account=>{
                    History.findOne({_id: result._id})
                    .then(his=>{
                        var arrayHistory = [];
                        if(his){
                            if(his.historycontent.length<=3) arrayHistory=his.historycontent;
                            else arrayHistory=his.historycontent.slice(his.historycontent.length-3,his.historycontent.length);
                        }
                        
                        // res.json(account.username);
                        // res.json(arrayHistory);
                        res.render('private',{
                            product:mulMgToObject(product),
                            accountname: account.username,
                            historydata: arrayHistory,
                            cart: account.cart,
                        });
                    })
                })
            }
            else{
                res.render('home',{
                    product:mulMgToObject(product),
                })
            }
        })
        .catch(next);
    }
    deleteproduct(req, res, next){
        var productId = req.params.idslug;
        var userid = req.cookies['userid'];
        if(userid){
            Account.findOne({ _id: userid})
            .then((data)=>{
                var cart = data.cart;
                var newcart = [];
                var k =0;
                for(var i=0;i<cart.length;i++){
                    if(cart[i]._id!=productId) {
                        newcart[k]=cart[i];
                        k++;
                    }
                }
                data.update({cart: newcart})
                .then(()=>{
                    res.send('1');
                })
                .catch(()=>{
                    res.send('0');
                })
            })
        }
        
    }
    
}
module.exports = new SiteController;