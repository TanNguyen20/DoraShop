const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose=require('mongoose');
// const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
require('./config/passport')(passport);

const path =require('path');
const app = express();
const route = require('./routes');
const db = require('./config/db');
const SortMiddleware = require('./app/middlewares/SortMiddleware');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({
  extended :true
}));
app.use(express.json());
const port = process.env.PORT ||3000;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(SortMiddleware);
db.connect();


app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: 'mongodb://127.0.0.1:27017/quan_ly',
    }),
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('combined'));
app.engine('handlebars', exphbs({
    helpers: ({
      sum: (a,b)=> a+b,
      sortable: (field, sort)=>{
        const sortTypeName = field === sort.column ? sort.type: 'default';
        const icons ={
          default:'oi oi-elevator',
          asc: 'oi oi-sort-ascending',
          desc: 'oi oi-sort-descending',
        };
        const types = {
          default: 'desc',
          asc: 'desc',
          desc: 'asc',
        }
        const icon = icons[sortTypeName];
        const type = types[sortTypeName];

        return `<a href="?_sort&column=${field}&type=${type}">
                  <span class="${icon}"></span>
                </a>`;
      },
      page: (numberpage, historycontent)=> {
        var stringpage ="";
        for(i=1;i<=numberpage;i++){
          stringpage+=`<li class="pagination-item">
            <a href="?page=${i}" class="pagination-item__link">${i}</a>
          </li>`;
        }
        return stringpage;
      },
      pagesearch: (numberpage, historycontent)=> {
        var stringpage ="";
        for(i=1;i<=numberpage;i++){
          stringpage+=`<li class="pagination-item">
            <a href="?page=${i}&historycontent=${historycontent}" class="pagination-item__link">${i}</a>
          </li>`;
        }
        return stringpage;
      },
      pageadmin: (numberpage)=> {
        var stringpage ="";
        for(i=1;i<=numberpage;i++){
          stringpage+=`<li class="page-item"><a class="page-link" href="?page=${i}">${i}</a></li>`;
        }
        return stringpage;
      },
      pageadminsearch: (numberpage, historycontent)=> {
        var stringpage ="";
        for(i=1;i<=numberpage;i++){
          stringpage+=`<li class="page-item"><a class="page-link" href="?page=${i}&historycontent=${historycontent}">${i}</a></li>`;
        }
        return stringpage;
      },
      convertcurrency: (prices)=> {
        return prices.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
      });
      },
      renderCartInHeader: (cartarray)=> {
        var stringpage ="";
        if(cartarray.length<1) {
          stringpage+=`<img src="/assets/img/no-cart.png" alt="" class="header__cart-no-cart-img">
          <p class="header__card-list-text-no-cart">
            Chưa có sản phẩm
          </p>`;
          return stringpage;
        }
        var len =3;
        if(len>cartarray.length) len= cartarray.length;
        stringpage+=`<h3 class="header__cart-heading">Sản phẩm đã thêm</h3>`;
        stringpage+=`<ul class="header__cart-list-items">`;
        //nen dung cartarray.length hay len ???
        for(i=0;i<cartarray.length;i++) {
          stringpage+=`<li class="header__cart-items">
            <img src="${cartarray[i]._id.image}" alt="" class="header__cart-items-img">
            <div class="header__cart-items-info">
                <div class="header__cart-items-head">
                    <h5 class="header__cart-items-name">${cartarray[i]._id.name}</h5>
                    <div class="header__cart-items-price-wrap">
                        <span class="header__cart-items-price">${cartarray[i]._id.prices.toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        })}
                        </span>
                        <span class="header__cart-items-multiply">x</span>
                        <span class="header__cart-items-sl">${cartarray[i].amount}</span>
                    </div>
                </div>
                <div class="header__cart-items-body">
                    <span class="header__cart-items-description">Phân loại màu: Đen</span>
                </div>
            </div>
          </li>`;
        }
        stringpage+=`</ul>`;
        stringpage+=`<a href="/cart" class="header__cart-view-cart btn btn--primary">Xem giỏ hàng</a>`;
        return stringpage;
      },
      totalproduct: (cartarray)=> {
        var total =0
        for(var i=0; i<cartarray.length; i++){
          total+=cartarray[i].amount;
        }
        return total;
      },
      renderPageCart: (cartarray)=> {
        var stringpage ="";
        if(cartarray.length<1) {
          stringpage=`<p style="font-size:3rem;padding-left:16px;">Không có sản phẩm trong giỏ hàng</p>`;
          return stringpage;
        }
        stringpage+=`<form id="order-in-cart" class="order" action="/user/order" method="POST">`;
        var totalprices =0;
        for(i=0;i<cartarray.length;i++) {
          totalprices+=cartarray[i]._id.prices*cartarray[i].amount;
          var prices = cartarray[i]._id.prices*cartarray[i].amount;
          stringpage+=`<li class="list-cart-item">
          <div class="list-cart-item-header">
              <img src="${cartarray[i]._id.image}" alt="" class="list-cart-item-img">
              <input type="hidden" name="productimage" value="${cartarray[i]._id.image}"/>
              <input type="hidden" name="productname" value="${cartarray[i]._id.name}"/>
              <input type="hidden" name="productprices" value="${prices}"/>
              <span class="list-cart-item-name" name="nameproduct">${cartarray[i]._id.name}</span>
              <span class="list-cart-item-price">${prices.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}</span>
          </div>
          <div class="list-cart-item-color-amount">
              <div class="list-cart-item-color">
                  <label for="item-color">Màu:</label>
                  <select name="productcolor" id="item-color">`;
                  for(var j=0;j<cartarray[i]._id.color.length;j++){
                    stringpage+=`<option value="${cartarray[i]._id.color[j]}">${cartarray[i]._id.color[j]}</option>`;
                  }
                  stringpage+=`</select>
                  </div>
                  <span class="list-cart-item-amount">
                      <a href="${cartarray[i]._id._id}" class="delete-button" style="margin-right:8px;text-decoration:none;">Xóa</a>
                      <div class="buttons_added">
                          <input class="minus is-form" type="button" value="-">
                          <input aria-label="quantity" class="input-qty" max="100" min="1" name="amountProduct" type="number" value="${cartarray[i].amount}" placeholder="${cartarray[i].amount}">
                          <input class="plus is-form" type="button" value="+">
                        </div>
                  </span>
              </div>
          </li>`;

        }
        stringpage+=`<h2 id="totalprices" style="font-size:1.8rem; color:red;:">Tổng tiền: ${totalprices.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        })}</h2>`;
        stringpage+=`<div class="customer-information">
            <div class="list-cart-item-customerinformation">
                <p>Chọn địa chỉ</p>
                <div class="list-cart-item-choose-address" style="display:flex; justify-content-center; align-items:center">
                    <input type="radio" name="choosen" id="address-default" value="default" required>
                    <label class="list-cart-item-choose-address-default" for="address-default">Địa chỉ mặc định&nbsp&nbsp&nbsp</label>
                    <input type="radio" name="choosen" id="address-new" value="new" required >
                    <label class="list-cart-item-choose-address-new" for="address-new">Nhập địa chỉ mới</label>
                </div>
                <br><span id="checkinformation" style="color: red;font-size:1.4rem"></span>
                <div class="list-cart-item-customerinformation-header">
                    THÔNG TIN KHÁCH HÀNG:
                </div>
                <div class="list-cart-item-customerinformation-name auth-form__group">
                    <input type="text" name="customername" id="customername" placeholder="Họ Và Tên" class="input__customer-information" rules="required">
                    <span class="form-message" style="color: red;"></span>
                </div>
                <div class="list-cart-item-customerinformation-contact auth-form__group">
                    <input type="text" name="phonenumber" id="phonenumber" placeholder="Số Điện Thoại" class="input__customer-information" rules="required">
                    <span class="form-message" style="color: red;"></span>
                </div>
                <div class="list-cart-item-customer-information-address auth-form__group">
                    <span id="address" class="textarea__customer-information" role="textbox" contenteditable style="margin:10px 0"></span>
                    <input type="hidden" id="input-address" name="address" value=""  rules="required">
                    <span id ="checkaddr" class="form-message" style="color: red;"></span>
                </div>
                <div class="list-cart-item-customerinformation-total-price">
                    <input type="text" id="require" placeholder="Yêu Cầu Khác" class="input__customer-information" style="margin-top:10px">
                </div>
            </div>
        </div>`;
        
        stringpage+=`<button id="btn-order-in-cart" class="btn btn-buy" >ĐẶT HÀNG</button>
        </form>`;
        return stringpage;
      },
      rendercolor: (color)=> {
        var stringpage ="";
        stringpage+=`<div class="list-cart-item-color">
              <label for="item-color">Màu:</label>
              <select name="productcolor" id="item-color">`;
        for(i=0;i<color.length;i++){
          stringpage+=`<option value="${color[i]}">${color[i]}</option>`;
          
        }
        stringpage+=`</select>
        </div>
        <span class="list-cart-item-amount">
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-">
                <input aria-label="quantity" class="input-qty" max="20" min="1" name="amountProduct" type="number" value="1" placeholder="1">
                <input class="plus is-form" type="button" value="+">
              </div>
        </span>`;
        return stringpage;
      },
      rendertable: (array,myorderDetail)=>{
        var str="";
        var historyTotalPrices=0;
        for(var it=0;it<array.length;it++){
          str+=`<div class="my-order" style="background-color:white;">
                  <ul style="padding:0">
                    <input name="idOrder" hidden class="input-cancel" value="${myorderDetail[it]._id._id}">
                    <ul class="history-no-padding">
                      <li style="font-size:1.4rem"><p>Ngày đặt mua: ${array[it].buytime}</p></li>`;
          for(var it1=0;it1<array[it].list.length;it1++){
            historyTotalPrices+=array[it].list[it1].pricesproduct*array[it].list[it1].amountproduct;
            str+=`<li class="history-content" style="display:flex;align-items:center;justify-content:space-between;font-size:1.4rem;margin:10px 0;border-top: 1px grey solid;">
                    <div style="display: flex; align-items:center;" class="history-order">
                        <img src="${array[it].list[it1].imageproduct}" alt="hinh anh" alt="hinh anh" style="width: 60px;height: 60px;">
                        <div style="display: block;line-height: 1.4rem;">
                            <p>${array[it].list[it1].nameproduct}</p>
                            <p>Màu sắc: ${array[it].list[it1].color}</p>
                            <p>Số lượng: ${array[it].list[it1].amountproduct}</p>
                        </div>
                    </div>
                    <span class="history-prices">${array[it].list[it1].pricesproduct.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    })}</span>
                  </li>`;
          }
          str+=`<div style="display:flex;justify-content:space-between;align-items:center;" class="cancel-orders"><h3 style="color:red;">Tổng tiền: ${historyTotalPrices.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND'
            })}</h3></div></ul>
            </ul>
          </div>`;
          historyTotalPrices=0;
        }
        return str;
      },
      rendertable1: (array,myorderDetail)=>{
        var str="";
        var historyTotalPrices=0;
        for(var it=0;it<array.length;it++){
          str+=`<div class="my-order" style="background-color:white;">
                  <ul style="padding:0">
                    <input name="idOrder" hidden class="input-cancel" value="${myorderDetail[it]._id._id}">
                    <ul class="history-no-padding">
                      <li style="font-size:1.4rem"><p>Ngày đặt mua: ${array[it].buytime}</p></li>`;
          for(var it1=0;it1<array[it].list.length;it1++){
            historyTotalPrices+=array[it].list[it1].pricesproduct*array[it].list[it1].amountproduct;
            str+=`<li class="history-content" style="display:flex;align-items:center;justify-content:space-between;font-size:1.4rem;margin:10px 0;border-top: 1px grey solid;">
                    <div style="display: flex; align-items:center;" class="history-order">
                        <img src="${array[it].list[it1].imageproduct}" alt="hinh anh" alt="hinh anh" style="width: 60px;height: 60px;">
                        <div style="display: block;line-height: 1.4rem;">
                            <p>${array[it].list[it1].nameproduct}</p>
                            <p>Màu sắc: ${array[it].list[it1].color}</p>
                            <p>Số lượng: ${array[it].list[it1].amountproduct}</p>
                        </div>
                    </div>
                    <span class="history-prices">${array[it].list[it1].pricesproduct.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    })}</span>
                  </li>`;
          }
          if(array[it].Status==1){
            str+=`<div style="display:flex;justify-content:space-between;align-items:center;" class="cancel-orders"><h3 style="color:red;">Tổng tiền: ${historyTotalPrices.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}</h3>
              <a href="/user/cancelorder" style="text-decoration:none;" class="btn-cancel-order">Hủy đơn</a>
              </div></ul>
              </ul>
            </div>`;
          }
          else{
            str+=`<div style="display:flex;justify-content:space-between;align-items:center;" class="cancel-orders"><h3 style="color:red;">Tổng tiền: ${historyTotalPrices.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}</h3><p style="color:red;">Chờ hủy</p></div></ul>
              </ul>
            </div>`;
          }
          
          historyTotalPrices=0;
        }
        return str;
      },
      renderPrices: (prices)=>{
        return prices.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND'
        });
      },
      checkValueSelected:(val,valueInSelectOption)=>{
        if(val==valueInSelectOption) return `selected`;
      },
    })
    
}));
// const app1 = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', function (socket) {
  console.log('...........................Welcome to server chat.......................................');

  socket.on('send', function (data) {
      io.sockets.emit('send', data);
  });
});
server.listen(34567);

app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname,'public')));
app.set('views', path.join(__dirname, 'resources','view'));
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
})
app.use(cookieParser('mk'));// neu khong co ma secret se khong the lay duoc cookie thong qua req.cookies
route(app);