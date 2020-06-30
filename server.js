var express =require("express")
const bodyparser=require("body-parser")
const app=express();
var mongoose=require("mongoose")
var mongo=require("mongodb");
var clients = require('./schema.js')
var cron = require("node-cron")
var redis = require("redis");

//port number
const port=process.env.PORT|| 5000;

//connecting to redis
var client = redis.createClient(6379);
client.on('connect', function() {
    console.log('reddis connected');
});

//url to connect with database
var url="mongodb://localhost:27017/project"

mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true })
const db=mongoose.connection; 


//on successfull connection with database
db.once('open', function(callback){ 
    // console.log(db.collections.find())
    console.log("connection succeeded with mongo"); 
});


//getting the current time
var date = new Date();
var timenow = date.getTime()/60


app.use(bodyparser.json());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));


//app listening to the port
app.listen(port, () => {
    console.log("server on")
});


//api to post the data in db
app.post('/sub',function(req,res)
{
    
    var temp = req.body.time;
    var date = req.body.date;
     temp = date+" "+temp;
     console.log(temp);
    var date2 = new Date(temp)
    var time2 = date2.getTime()/60
    var data ={
        user_id: req.body.user_id,
        url:req.body.url,
        create_time:req.body.create_time,
        time : time2,
        verb : req.body.verb,
        create_time : timenow   
            }

    db.collection('clients').insertOne(data, function(err,succes)
   {
  if(err)
  console.log("error =   "+err);
  else
  {
  console.log("data updated");
  res.send("data updated successfully");
  }});
})

//1st cron which will run in 15 minute interval
cron.schedule('0,15,30,45 * * * *',() =>
{
        console.log("hello");
        db.collection("clients").find({ "time": {$gt:new Date().getTime()/60, $lt:(new Date().getTime()/60)+(15*60)}}).toArray(function(err, result) {
            if (err) throw err;
           // console.log(result);
           result.forEach(ele =>
            {
                client.set(ele.time,ele.url,() =>
                {
                    console.log(ele.time);
                });
                
            })
          });
          

});
cron.schedule('* * * * *',() =>
{
    console.log("second cron");
    

})






