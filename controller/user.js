const User = require('../models/user.js');

module.exports.renderSignupForm = (req, res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next)=>{
    try {
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser)
        req.login(registeredUser, (err) =>{
        if (err) {
            return next(err); 
        }
        req.flash('success', 'Welcome to Wanderlust!');
        res.redirect(res.locals.redirectUrl || '/listings');
        });
        
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/signup');
    }
};

module.exports.renderLoginForm =  (req, res)=>{
    res.render("users/login.ejs");
};

module.exports.login =  async(req, res)=>{
            req.flash("success", "Welcome to WanderLust!");
            let redirectUrl = res.locals.redirectUrl || '/listings';
            res.redirect(redirectUrl );
};

module.exports.logout = (req, res, next)=>{
    req.logout((err) =>{
        if (err) {
            return next(err); 
        }
        req.flash("success", "You are Logged out!");
        res.redirect("/listings");
    });
};