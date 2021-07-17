const express = require('express');
const Product = require('../models/product');
const Course = require('../models/course');
const {mulMgToObject, mongooseToObject} = require('../../util/mongo');
const Account = require('../models/account');
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
var md5 = require('md5');
class MeController{
    checkadmin(req, res, next){
        try {
            var token = req.cookies.token;
            var result = jwt.verify(token,'mk');// result tra ve chinh la _id duoc truyen vao luc tao token
            
            if(result){
                Account.findOne({ _id: result })
                .then(account =>{
                    if(account.permissions==100){
                        next();
                    }
                    else{
                        res.json('ban khong co du quyen');
                    }
                    // res.render('private',{accountname: account.username});
                })
                .catch(err =>{
                    res.json('khong tim thay tai khoan');
                })

            }
            else{
                res.json('token khong dung hoac khong ton tai token');
            }
        } catch (error) {
            res.redirect('/user/Login');
        }
    }
    //
    storedCourses(req, res,next){
        let courseQuery = Course.find({});
        let courserCountDelete = Course.countDocumentsDeleted();
        // res.json(req.query);
        if(req.query.hasOwnProperty('_sort')){
            courseQuery=courseQuery.sort({
                [req.query.column]: req.query.type,
            });
            
        }
        Promise.all([courseQuery,courserCountDelete])
            .then(([courses, countSoftDelete]) => 
                res.render('me/stored-courses',{
                    countSoftDelete,
                    courses: mulMgToObject(courses),
                }),
            )
            .catch(next);
        
    }
    //
    storedProduct(req, res,next){
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        let countProduct = Product.countDocuments({});
        Product.countDocuments(function(err, countProduct){
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
            if(skipdocument<0 ) skipdocument=0;
            let productQuery = Product.find({}).limit(10).skip(skipdocument);
            let productCountDelete = Product.countDocumentsDeleted();
            if(req.query.hasOwnProperty('_sort')){
                productQuery=productQuery.sort({
                    [req.query.column]: req.query.type,
                });
                
            }
            Promise.all([productQuery,productCountDelete])
                .then(([product, countSoftDelete]) => 
                    {
                        res.render('me/stored-product',{
                            countSoftDelete,
                            product: mulMgToObject(product),
                            countProduct:totalpage,
                            nextpage,
                            priviouspage,
                        })
                    }
                )
                .catch(next);
        })
    }
    //
    trashCourses(req, res,next){
        let courseQuery = Course.findDeleted({});
        // res.json(req.query);
        if(req.query.hasOwnProperty('_sort')){
            courseQuery=courseQuery.sort({
                [req.query.column]: req.query.type,
            });
            
        }
        Promise.all([courseQuery])
            .then(([courses]) => 
                res.render('me/trash-courses',{
                    courses: mulMgToObject(courses)
                }),
            )
            .catch(next);
    }
    //
    trashProduct(req, res,next){
        let productQuery = Product.findDeleted({});
        if(req.query.hasOwnProperty('_sort')){
            productQuery=productQuery.sort({
                [req.query.column]: req.query.type,
            });
            
        }
        Promise.all([productQuery])
            .then(([product]) => 
                res.render('me/trash-product',{
                    product: mulMgToObject(product)
                }),
            )
            .catch(next);
    }
    //
    trashOrder(req, res,next){
        let orderQuery = Order.findDeleted({});
        if(req.query.hasOwnProperty('_sort')){
            orderQuery=orderQuery.sort({
                [req.query.column]: req.query.type,
            });
            
        }
        Promise.all([orderQuery])
            .then(([order]) => 
                res.render('me/trash-order',{
                    order: mulMgToObject(order)
                }),
            )
            .catch(next);
    }
    //
    ordermanagement(req, res,next){
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        let countOrder = Order.countDocuments({});
        Order.countDocuments(function(err, countOrder){
            var totalpage = Math.ceil(countOrder/10);
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
            if(skipdocument<0 ) skipdocument=0;
            let orderQuery = Order.find({}).limit(10).skip(skipdocument);
            let orderCountDelete = Order.countDocumentsDeleted();
            if(req.query.hasOwnProperty('_sort')){
                orderQuery=orderQuery.sort({
                    [req.query.column]: req.query.type,
                });
                
            }
            Promise.all([orderQuery,orderCountDelete])
                .then(([order, countSoftDelete]) => 
                    {
                        res.render('me/ordermanagement',{
                            countSoftDelete,
                            order: mulMgToObject(order),
                            countOrder:totalpage,
                            nextpage,
                            priviouspage,
                        })
                    }
                )
                .catch(next);
        })
    }
    detail(req, res, next){
        var orderId = req.params.orderid;
        Order.findOne({_id: orderId})
        .then((data)=>{
            res.render('me/detail',{
                order: mongooseToObject(data),
            });
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
    }
    statusnegative1(req, res, next){
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        Order.find({status:1})
        .then((data)=>{
            var totalpage = Math.ceil(data.length/10);
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;
            let nextpage, priviouspage;
            if(pageindex+1>totalpage) nextpage = totalpage;
            else nextpage = pageindex +1;
            if(pageindex-1<1) priviouspage = 1;
            else priviouspage = pageindex-1;
            var skipdocument =(pageindex-1)*10;
            if(skipdocument<0 ) skipdocument=0;
            let orderQuery = Order.find({status:-1}).limit(10).skip(skipdocument);
            let orderCountDelete = Order.count({status:2});
            if(req.query.hasOwnProperty('_sort')){
                orderQuery=orderQuery.sort({
                    [req.query.column]: req.query.type,
                });
                
            }
            Promise.all([orderQuery,orderCountDelete])
                .then(([order, countSoftDelete]) => 
                    {
                        res.render('me/order-status-negative-1',{
                            countSoftDelete,
                            order: mulMgToObject(order),
                            countOrder:totalpage,
                            nextpage,
                            priviouspage,
                        })
                    }
                )
                .catch(next);
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
        
    }
    status1(req, res, next){
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        Order.find({status:1})
        .then((data)=>{
            var totalpage = Math.ceil(data.length/10);
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;
            let nextpage, priviouspage;
            if(pageindex+1>totalpage) nextpage = totalpage;
            else nextpage = pageindex +1;
            if(pageindex-1<1) priviouspage = 1;
            else priviouspage = pageindex-1;
            var skipdocument =(pageindex-1)*10;
            if(skipdocument<0 ) skipdocument=0;
            let orderQuery = Order.find( {$or:[{status:1},{status:-1}]}).limit(10).skip(skipdocument);
            let orderCountDelete = Order.count({status:2});
            if(req.query.hasOwnProperty('_sort')){
                orderQuery=orderQuery.sort({
                    [req.query.column]: req.query.type,
                });
                
            }
            Promise.all([orderQuery,orderCountDelete])
                .then(([order, countSoftDelete]) => 
                    {
                        res.render('me/order-status-1',{
                            countSoftDelete,
                            order: mulMgToObject(order),
                            countOrder:totalpage,
                            nextpage,
                            priviouspage,
                        })
                    }
                )
                .catch(next);
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
        
    }
    status0(req, res, next){
        let pageindex = Number(req.query.page);
        if(!pageindex){
            pageindex =1;
        }
        Order.find({status:0})
        .then((data)=>{
            var totalpage = Math.ceil(data.length/10);
            if(pageindex> totalpage) pageindex = totalpage;
            else if(pageindex<1) pageindex =1;
            let nextpage, priviouspage;
            if(pageindex+1>totalpage) nextpage = totalpage;
            else nextpage = pageindex +1;
            if(pageindex-1<1) priviouspage = 1;
            else priviouspage = pageindex-1;
            var skipdocument =(pageindex-1)*10;
            if(skipdocument<0 ) skipdocument=0;
            let orderQuery = Order.find({status:0}).limit(10).skip(skipdocument);
            let orderCountDelete = Order.count({$or:[{status:1},{status:-1}]});
            if(req.query.hasOwnProperty('_sort')){
                orderQuery=orderQuery.sort({
                    [req.query.column]: req.query.type,
                });
                
            }
            Promise.all([orderQuery,orderCountDelete])
                .then(([order, countSoftDelete]) => 
                    {
                        res.render('me/order-status-0',{
                            countSoftDelete,
                            order: mulMgToObject(order),
                            countOrder:totalpage,
                            nextpage,
                            priviouspage,
                        })
                    }
                )
                .catch(next);
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
        
    }
    status2(req, res, next){
        Order.find({status:2})
        .then((data)=>{
            res.render('me/order-status-2',{
                order: mulMgToObject(data),
            });
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
        
    }
    statistical(req, res, next){
       Order.find({status:2})
       .then(data=>{
        var pricesInMonth=[0,0,0,0,0,0,0,0,0,0,0,0];
        var convertMonth ={'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12 };
        //    res.json(data);
        //    res.json(data[0].updatedAt.toString().split(" ")[2]);
           for(var i=0;i<data.length;i++){
               var totaltemp=0;
               var month = data[i].updatedAt.toString().split(" ")[1];
            //    res.json(convertMonth[month]);
               var element = data[i].orderdetail;
                for(var j=0;j<element.length;j++){
                    pricesInMonth[convertMonth[month]-1]+= (element[j].amountproduct*element[j].pricesproduct)/1000000;
                }
           }
        //    res.json(pricesInMonth);
           res.render('me/chart',{
               pricesInMonth
           });
       })
        
    }
    changestatus1(req, res, next){
        Order.updateOne({_id: req.params.idorder},{status:1})
        .then(()=>{
            res.redirect('back');
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
        
    }
    async changestatus2(req, res, next){
        try {
            await Order.updateOne({_id: req.params.idorder},{status:2});
            var productUpdateNumber = await Order.findOne({_id: req.params.idorder});
            for(var i =0 ; i< productUpdateNumber.orderdetail.length;i++){
                var productInfo = await Product.findOne({name: productUpdateNumber.orderdetail[i].nameproduct});
                var count=0;
                if(productInfo.buyNumProduct){
                    count = productInfo.buyNumProduct + productUpdateNumber.orderdetail[i].amountproduct;
                }
                else{
                    count = productUpdateNumber.orderdetail[i].amountproduct;
                }
                await Product.updateOne({name: productInfo.name},{
                    buyNumProduct: count,
                })
            }
            res.redirect('back');
        } catch (error) {
            console.log("co loi khi cap nhat trang thai don hang hoac so luong duoc mua cua san pham, thong tin loi: "+error);
        }
        
       
        
    }
    changestatusnegative2(req, res, next){
        Order.updateOne({_id: req.params.idorder},{status:-2})
        .then(()=>{
            res.redirect('back');
        })
        .catch(()=>{
            res.json('co loi xay ra');
        })
        
    }
}
module.exports = new MeController();