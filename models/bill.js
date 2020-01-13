const mongoose = require('mongoose');

const billSchema = mongoose.Schema({
    friend : {
        type: Array,
        required : true
    },
    description : {
        type:String,
        required: true
    },
    amount :{
        type: Number,
        required: true
    }
});

const Bill = mongoose.model('bill',billSchema);

module.exports = Bill;