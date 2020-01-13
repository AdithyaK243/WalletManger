const express = require('express');
const router = express.Router();
const {ensureAuthenticated } = require('../config/auth');

//Model
const User = require('../models/Users');
const Bill = require('../models/bill');

//Welcome page
router.get('/',(req,res) =>{
    res.render('welcome');
});

//Dashboard
router.get('/dashboard',ensureAuthenticated,(req,res) =>{
    console.log(req.user);
    Bill.find({_id : req.user.bill},(err,bill) =>{
        if(err){
            console.log(err);
            return;
        }else{
            console.log(bill);
            console.log('hi2');
            res.render('dashboard',{
                name : req.user.name,
                cash:req.user.cash,
                bill : bill
            })
        }
    });
});

//Wallet
router.get('/wallet',ensureAuthenticated,(req,res) =>{
    req.flash('info','Update wallet to go to dashboard');
    res.render('wallet',{
        cash: req.user.cash
    });
});

//Wallet post
router.post('/dashboard',ensureAuthenticated,(req,res) =>{


    req.user.cash = req.body.cash;

    req.user.save(err =>{
        if(err){
            console.log(err);
            return;
        }else{
            Bill.find({_id: req.user.bill},(err,bill) =>{
                console.log(bill);
                console.log('hi');
                res.render('dashboard',{
                    name: req.user.name,
                    cash : req.user.cash,
                    bill : bill
                })
           })
        }
    })
                
});


//Adding the bill to the list
router.post('/bill', ensureAuthenticated,(req,res) =>{
    const bill = new Bill();
    bill.friend.push(req.body.friends);
    bill.description = req.body.description;
    bill.amount = req.body.amount;
    
    
    //To add the current user to bill
    bill.friend.push(req.user.name);

    bill.save(err =>{
        if(err){
            console.log(err);
            return;
        }else{
            //to add bill to all the other users
            bill.friend[0].forEach((fren) => {
                User.find({name : fren},(err,user) =>{
                    console.log(user);
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        user.forEach(item =>{
                                item.settle.push(bill.id);
                                item.save(err =>{
                                if(err){console.log(err);}
                                })
                        })
                    }
                })
            })
       
            //To add bill to current user
            req.user.bill.push(bill.id);
            req.user.save(err =>{
                if(err){
                    console.log(err);
                    return;
                }else{
                    res.redirect('/dashboard');
                }
            });
        }
    })
});

//Settle
router.get('/settle',ensureAuthenticated,(req,res) => {
    Bill.find({_id: req.user.settle},(err,bill) =>{
        if(err){
            console.log(err);
            return;
        }else{
            res.render('settle',{
                name : req.user.name,
                cash : req.user.cash,
                bill : bill
            })
        }
    })
})

router.post('/settling',ensureAuthenticated,(req,res) =>{
    amt = req.body.amt;
    id = req.body.bill_id;
    friend = req.body.friend;
    tot = req.body.total;
    curUs = req.user;

    tot = tot - amt;
    Bill.findById(id,(err,bill) =>{
        if(err){
            console.log(err);
            return;
        }else{
            User.findOne({name:bill.friend[1]},(err,user) =>{
                console.log(user);
                if(err){
                    console.log(err);
                    return;
                }else{
                    user.cash = +user.cash + +amt;
                    if(tot == 0){
                        user.bill.splice(user.bill.indexOf('id'),1);
                        Bill.deleteOne({id : id},(err) => { console.log(err);})
                    }
                }
                user.save(err=> {
                    if(err){console.log(err);}
                });
            })
        }
    })
    curUs.cash = curUs.cash - amt;
    curUs.settle.splice(curUs.settle.indexOf('id'), 1 );
    curUs.save(err =>{
        if(err){
            console.log(err);
            return;
        }else{
            Bill.find({_id : req.user.settle},(err,bill) =>{
                if(err){
                    console.log(err);
                    return;
                }else{
                    
                }
                console.log(bill);
                req.flash('success','bill Settled');
                location.reload()
            })
        }
    });
})


module.exports = router;