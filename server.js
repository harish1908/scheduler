var express =require("express")
const bodyparser=require("body-parser")
const app=express();
var mongoose=require("mongoose")
var mongo=require("mongodb");
var clients = require('./schema.js')
var request = require('request');
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
var timenow =new Date().getTime()/60000;
    timenow =Math.floor(timenow);


app.use(bodyparser.json());
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));


//app listening to the port
app.listen(port, () => {
    console.log("server on")
});

var chrontime=0;



//api to post the data in db
app.post('/sub',function(req,res)
{
    
    var temp = req.body.time;
    var date = req.body.date;
     temp = date+" "+temp;
     var regEx = /^\d{4}-\d{2}-\d{2}$/;
     if(!date.match(regEx)) 
     res.send(" input the correct format date yyyy-mm-dd && time hh:mm:ss");
    else{
    var date2 = new Date(temp)
    var time2 = date2.getTime()/60000;
    time2 = Math.floor(time2);
    console.log(time2);
    var data = {
        user_id: req.body.user_id,
        url:req.body.url,
        create_time:req.body.create_time,
        execution_time : time2,
        verb : req.body.verb,
        time : req.body.time,
        date : req.body.date, 
        body : req.body.body,
        modified_time : req.body.create_time,
        created_by : req.body.user_id,
        response : null,
        body : req.body.body,
        Header :req.body.header

            }
            var timenow =new Date().getTime()/60000;
            timenow =Math.floor(timenow);
            if(time2-timenow===1 || time2-timenow ===0)
            {
                data_url ={
                    method : data.verb,
                    url : data.url,
                    header : data.Header,
                    body : data.body,
                    user_id: data.user_id
                }
                console.log("data with the url ="+data_url);
                try{
                    request(data_url,(err,resp,body) =>
                    {
                        console.log("success "+resp.statusCode);
                        data.response = resp.statusCode;
                        db.collection('clients').insertOne(data, function(err,succes)
                        {
                       if(err)
                       {
                       console.log("error =   "+err);
                       if(err.code===11000)
                       res.send("duplicate key");
                       }
                       else
                       res.send(body);
                       });
                    });
                }
                catch{
                    console.log("failed");
                    res.send("failed");
                }
            }
            else{
            if(chrontime===0)
            {
                data_url ={
                    method : data.verb,
                    url : data.url,
                    header : data.Header,
                    body : data.body
                }
                console.log("data with the url ="+data_url);
                client.lpush(time2.toString(),data_url, (err,res) =>
                {
                    if(err)
                    console.log("failed to push data in the list");
                    console.log("data inserted in list");
                });
            }
            else if(time2<=chrontime+15)
            {
                data_url ={
                    method : data.verb,
                    url : data.url,
                    header : data.Header,
                    body : data.body
                }
                console.log("data with the url ="+data_url);
                client.lpush(time2.toString(),data_url, (err,res) =>
                {
                    if(err)
                    console.log("failed to push data in the list");
                    console.log("data inserted in list");
                });
            }
            
                db.collection('clients').insertOne(data, function(err,succes)
                {
               if(err)
               {
               console.log("error =   "+err);
               if(err.code===11000)
               res.send("duplicate key");
               }
               else
               {
               console.log("data updated");
               res.send("data updated successfully");
               }});
            
        }

    } 
})


//1st cron which will run in 15 minute interval
cron.schedule('0,15,30,45 * * * *',() =>
{
    var timenow =new Date().getTime()/60000;
    timenow =Math.floor(timenow);
    
    chrontime=timenow;
        console.log("first cron");
        db.collection("clients").find({ "execution_time": {$gt:new Date().getTime()/60000, $lt:(new Date().getTime()/60000)+15}}).toArray(function(err, result) {
            if (err)
            {
                    console.log(err);
                    throw err;
            } 
           result.forEach(ele =>
            {
                data ={
                    method : ele.verb,
                    url : ele.url,
                    header : ele.Header,
                    body : ele.body,
                    user_id:ele.user_id
                }
                
                client.lpush(ele.execution_time.toString(),data, (err,res) =>
                {
                    if(err)
                    console.log("failed to push data in the list");
                    console.log("data inserted in list");
                });
            })
            
          });
          

});

cron.schedule('* * * * *',() =>
{
    console.log("second cron");
    var now = new Date().getTime()/60000;
    now = Math.floor(now);
    console.log(now);
    client.llen(now.toString(),(err,res)=>
        {
     if(res!=0){
    client.lrange(now.toString(),0,res-1,(err,result)=>
    {
        result.forEach(ele =>
        {
            try{
                request(ele,(err,res) =>
                {
                    console.log("success "+res.statusCode);
                    db.collection('clients').updateOne({user_id:ele.user_id},{$set : {"response":resp.statusCode}},function(err,result)
                    {
                        if(err)
                        console.log("failed to update response");
                    })
                });
            }
            catch{
                console.log("failed to hit url");
                db.collection('clients').updateOne({user_id:ele.user_id},{$set : {"response":"failed"}},function(err,result)
                    {
                        if(err)
                        console.log("failed to update response");
                        
                    })
            }
            
        })
        
    })
 }})
});


