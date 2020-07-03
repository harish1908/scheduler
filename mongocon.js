const mongoose = require("mongoose");
const mongo = require("mongodb")
let url="mongodb://localhost:27017/project"
mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true })
const db=mongoose.connection;
//on successfull connection with database
db.once('open', ()=>{
    // console.log(db.collections.find())
    console.log("connection succeeded with mongo");
});
module.exports = {
    db : db
}