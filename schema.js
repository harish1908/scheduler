var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    id : {
        type: Number,
        auto:1,
    },

    user_id: {
        type: String,
        required: true,
        unique : true
        },

    url: {
        type: String,
        required: true,
        },

    body: {
         type: String
            },

    verb: {
        type: String,
        required: true,
        uppercase : true 
        },

    Header: {
        type: String
        },

    response: {
        type: String
        },
        
    
    created_by : {
        type : String
    },

    create_time :
    {
        type: Date,
        default : Date.now
    },

    modified_by : {
        type : String
    },

    modified_time :
    {
        type: Date,
        default : null
    },

    time : { type : Date, default: Date.now },
    
    Interval : {
        type : Number
    }
});

const client = module.exports = mongoose.model('client', schema);