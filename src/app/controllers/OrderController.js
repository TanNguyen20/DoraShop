const Product = require('../models/product');
const {mongooseToObject} = require('../../util/mongo');
const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const Order = require('../models/order');
const History = require('../models/historyfind');
const {mulMgToObject} = require('../../util/mongo');
class OrderController{
    
    delete(req, res, next){
        Order.updateOne({_id: req.params.id},{status:1})
        .then(()=>{
            Order.delete({_id: req.params.id})
            .then(()=> {
                res.redirect('back')
            })
            .catch(next);
        })
        .catch(()=>{
            res.json('co loi');
        })
    }
    
    destroy(req, res, next){
        Order.deleteOne({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    
    restore(req, res, next){
        Order.restore({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    
    handleFormActions(req, res, next){
        switch(req.body.action){
            case 'delete':
                Order.delete({_id: {$in: req.body.orderId}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            case 'destroy':
                // res.json(req.body.orderId);
                Order.deleteMany({_id: {$in: req.body.orderId}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            case 'restore':
                Order.restore({_id: {$in: req.body.orderId}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            case 'changestatus':
                Order.updateMany({_id: {$in: req.body.orderId}},{status:-2})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            default: res.json({message: 'Action is invalid!'});
        }
    }
}
module.exports = new OrderController();