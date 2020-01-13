const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    amount :{
        type: Number,
        required: true
    }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;