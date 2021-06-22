//khong dung file nay
const Course = require('../models/course');
const {mongooseToObject} = require('../../util/mongo');
class CoursesController{

    show(req, res,next){
        Course.findOne({slug: req.params.slug})
            .then(course=>{
                // Neu co du lieu trong database thi hien thi khong thi chuyen huong nguoi dung ve trang home
                if(course!=null) res.render('courses/show',{course: mongooseToObject(course)});
                else res.redirect('/');
            })
            .catch(next);
        
    }
    create(req, res,next){
       res.render('courses/create');
    }
    // luu tru khoa hoc cho create.handlebars thong qua action=/course/store
    store(req, res , next){
        const formData = req.body;
        formData.image = `https://img.youtube.com/vi/${req.body.videoId}/sddefault.jpg`;
        const course = new Course(formData);
        course.save()
            .then( () =>res.redirect('/me/stored/courses'))
            .catch(error =>{

            });
    }
    // /course/:id/edit
    edit(req, res,next){
        Course.findById(req.params.id)
            .then(course =>res.render('courses/edit',{
                course: mongooseToObject(course),
            }))
            .catch(next);
     }
    // PUT /course/:id
    update(req, res, next ){
        Course.updateOne({_id: req.params.id},req.body)
            .then(()=> res.redirect('/me/stored/courses'))
            .catch(next);
    }
    //  DELETE /course/:id soft delete
    delete(req, res, next){
        Course.delete({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    //DELETE /course/:id/destroy destroy delete
    destroy(req, res, next){
        Course.deleteOne({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    //restore PATCH
    restore(req, res, next){
        Course.restore({_id: req.params.id})
            .then(()=> res.redirect('back'))
            .catch(next);
    }
    // xu li trong form store va form trash POST
    handleFormActions(req, res, next){
        switch(req.body.action){
            case 'delete':
                Course.delete({_id: {$in: req.body.courseIds}})
                    .then(()=> res.redirect('back'))
                    .catch(next);
                break;
            default: res.json({message: 'Action is invalid!'});
        }
    }
}
module.exports = new CoursesController();