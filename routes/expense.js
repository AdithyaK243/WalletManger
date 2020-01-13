const express = require('express');
const router = express.Router();
const {ensureAuthenticated } = require('../config/auth');

const User = require('../models/Users');
const Expense = require('../models/expenses');

//Dashboard 
router.get('/',ensureAuthenticated,(req,res) => {
    User.findOne({email : req.user.email},(err,user) =>{
        if(err){
            console.log(err);
            return;
        }else{
            Expense.find({_id:user.expense},(err,expenses) =>{
                if(err){
                    console.log(err);
                    return;
                }else{
                    res.render('expense',{
                        expenses: expenses
                    })
                }
            })
        }
    })
    
});

//Add expense
router.get('/add', (req,res) =>{
    res.render('add_expense');
});


//post handler add expense
router.post('/add',ensureAuthenticated,(req,res) =>{
    const { title,description,amount} = req.body;
    const exp_err = [];

    //Check required fields
    if(!title || !description || !amount ){
        exp_err.push({msg : 'Please fill in all fields'});
    }

    if(exp_err != ''){
        res.render('add_expense',{
            exp_err,
            title,
            description,
            amount
        });
    }else{
            const expense = new Expense();
            expense.title = req.body.title;
            expense.description = req.body.description;
            expense.amount = req.body.amount;

            expense.save((err) =>{
                if(err){
                    console.log(err);
                    return;
                }else{
                    User.findOne({email: req.user.email},(err,user) =>{
                        if(err){
                            console.log(err);
                            return;
                        }else{
                            user.expense.push(expense.id);
                            user.save();
                        }
                    })
                    req.flash('success','Expense added');
                    res.redirect('/expense');
            }
        });

        
    }
    
});

//View each expense
router.get('/:id', (req,res) =>{
    Expense.findById(req.params.id, (err,expense) => {
        res.render('each_expense',{
            expense:expense
        });
    });
});

//Edit each expense
router.get('/edit/:id', (req,res) =>{
    Expense.findById(req.params.id, (err,expense) => {
        res.render('edit_expense',{
            expense:expense
        });
    });    
});

//Edit expense post handler
router.post('/edit/:id', (req,res) =>{
    const expense = {}
    expense.title = req.body.title;
    expense.description = req.body.description;
    expense.amount = req.body.amount;
    // console.log(expense);
    // console.log(req.params); 

    let query = {_id: req.params.id}

    Expense.updateOne(query,expense,(err) =>{
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success','Expense has been updated');
            res.redirect('/expense');
        }
    });
});

//Delete Get request
router.get('/delete/:id',(req,res) =>{
    const query = {_id: req.params.id}

    Expense.deleteOne(query,(err) =>{
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success','Expense deleted');
            res.redirect('/expense');
        }
    })
});

module.exports = router;