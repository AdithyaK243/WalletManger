const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model 
const User = require('../models/Users');

//Login Page
router.get('/login',(req,res) =>{
    res.render('login');
});

//Register
router.get('/register',(req,res) =>{
    res.render('register');
});

//Register handle
router.post('/register', (req,res) =>{
    const { name,email,password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg : 'Please fill in all fields'});
    }

    //Check passwords match
    if(password !== password2){
        errors.push({ msg : 'Passwords do not match'});
    }

    //Check password length
    if(password.length < 6){
        errors.push({msg:'passwords must be at least 6 chracters'});
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }else{
        //Validation passed
        User.findOne({ email : email})
            .then(user =>{
                if(user) {
                    //User exists
                    errors.push({msg : 'Email aready registered'});
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else{
                    const newUser = new User({
                        name,
                        email,
                        password,
                        cash: ''
                    });
                    //we have to save the model to show on database

                    //Hash Password
                    bcrypt.genSalt(10,(err,salt) => 
                        bcrypt.hash(newUser.password,salt,(err,hash) =>{
                            if(err) throw err;
                            //Set password to hashed
                            newUser.password = hash;
                            //Save User
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                    }))
                     
                }
            }); 
    }
});


//Login post request
router.post('/login',(req,res,next) =>{
    passport.authenticate('local', {
        successRedirect : '/wallet',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req,res,next);
    
});

//Logout handle
router.get('/logout',(req,res) =>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');
})

module.exports = router;