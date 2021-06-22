const Course = require('../models/course');
const {mulMgToObject} = require('../../util/mongo');
class SiteController{

    index(req, res, next){
        //res.render("home");
        Course.find({})
            .then(courses=>{
                
                res.render('home',{
                    courses:mulMgToObject(courses)
                })

            })
            .catch(next);
        
    }
    search(req,res){
        res.render("search");
    }
}
module.exports = new SiteController;