const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

//Init app
const app = express();

//Passport config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').database;


mongoose.connect(db,{useNewUrlParser: true,useUnifiedTopology : true})
    .then(() => console.log('MongoDB Connected....'))
    .catch(err => console.log(err)); 

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Body parser
app.use(express.urlencoded({extended : false}));

//Express Session Middleware
app.use(session({
    secret: 'secret',
    resave :true,
    saveUninitialized : true,
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Global vars
app.use((req,res,next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.bill_success = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); //for passport
    next();
});

//Routes file
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/expense',require('./routes/expense'));




const PORT = process.env.port || 3000;
app.listen(PORT, console.log(`Server started on ${PORT}`));