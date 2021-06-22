const express = require('express');
const path =require('path');
const app = express();
const route = require('./routes');
app.use(express.urlencoded({
  extended :true
}));
app.use(express.json());
route(app);
const port = process.env.PORT;
const db = require('./config/db');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

db.connect();
const exphbs = require('express-handlebars');
const morgan = require('morgan');
app.use(morgan('combined'));
app.engine('handlebars', exphbs({
    helpers: ({
      sum: (a,b)=> a+b,
  })
}));

app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname,'public')));
app.set('views', path.join(__dirname, 'resources','view'));
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
})



