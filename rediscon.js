const redis = require("redis");
let client = redis.createClient(6379);
client.on('connect', ()=> {
    console.log('reddis connected');
});

module.exports ={
    client:client
}