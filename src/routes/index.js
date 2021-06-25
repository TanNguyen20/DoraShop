const siteRouter = require('./site');
const authRouter = require('./auth');
const coursesRouter = require('./courses');
const meRouter = require('./me');
const userRouter = require('./user');
const productRouter = require('./product');
const orderRouter = require('./order');
function route(app){
    app.use('/order',orderRouter);
    app.use('/auth',authRouter);
    app.use('/product',productRouter);
    app.use('/user',userRouter);
    app.use('/me', meRouter);
    app.use('/courses', coursesRouter);
    app.use('/home',siteRouter);
    app.use('/',siteRouter);
}

module.exports = route;