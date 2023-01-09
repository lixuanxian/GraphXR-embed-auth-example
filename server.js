let express = require('express');
let app = express();
let path = require("path")
let passport = require('passport')
let session = require('express-session')
let env = require('dotenv').config();
let models = require("./app/models");
let exphbs = require('express-handlebars')
app.use(express.urlencoded({
    extended: true
})
);
app.use(express.json());

// For Passport
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})); // session secret

app.use(passport.initialize());

app.use(passport.session()); // persistent login sessions
//STYLING
app.use(express.static(path.join(__dirname, '/app/public')));

app.get('/', function (req, res) {
    res.redirect("/dashboard");
});

//For Handlebars
app.set('views', './app/views');
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false,
    layoutsDir: "views/layouts/"
}));
app.set('view engine', '.hbs');

require('./app/config/passport/passport.js')(passport, models.user);

//Sync Database
models.sequelize.sync()
    .then(function () {
        console.log('Nice! Database looks fine')
    }).catch(function (err) {
        console.log(err, "Something went wrong with the Database Update!")
});

//Routes
let authRoute = require('./app/routes/auth.js')(app,passport);

app.listen(5000, function (err) {
    if (!err){
        console.log("Site is live http://localhost:5000");
    }else{
         console.log(err);
    }
});