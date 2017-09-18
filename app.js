var express = require("express"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    mongoose = require("mongoose"),
    User = require("./models/user");
mongoose.connect("mongodb://localhost/auth_demo_app", {useMongoClient: true});



var app = express();
app.set('view engine', 'ejs');
app.use(require("express-session")({
    secret: "Ziggy is Cool",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));

// Set up methods
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//---------
//Routes
//---------

app.get("/", function(req, res){
    res.render("home"); 
});

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
});

//---------
//Auth Routes
//---------
app.get("/register", function(req, res) {
    res.render("register");
});
//handling user sign up
app.post("/register", function(req, res){
    // req.body.username
    // req.body.password
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        });
        
    });
});
//login routes
//login form
app.get("/login", function(req, res) {
    res.render("login");
});
//login logic, and middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res){
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }  
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is running...");
});