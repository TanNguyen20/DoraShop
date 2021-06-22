const Course = require('../models/course');
const {mulMgToObject} = require('../../util/mongo');
class MeController{

    storedCourses(req, res,next){
        Course.find({})
            .then( courses => res.render('me/stored-courses',{
                courses: mulMgToObject(courses)
            }))
            .catch(next);
        
    }
}
module.exports = new MeController();