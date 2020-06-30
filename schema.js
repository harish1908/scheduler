var mongoose = require('mongoose');
const { time, timeStamp } = require('console');
const { Timestamp } = require('bson');
const { timeAt } = require('tz-offset');

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
        default : new Date()
    },

    modified_by : {
        type : String
    },

    modified_time :
    {
        type: Date,
        default : null
    },

    execution_time : { type :  Date },
    
    date : {
        type : Date
    },

    time : {
        type : Date
    }
});

const client = module.exports = mongoose.model('client', schema);