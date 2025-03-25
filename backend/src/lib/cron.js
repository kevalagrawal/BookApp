import cron from 'cron';
import https from 'https';

export const job = new cron.CronJob("*/14 * * * *",function(){
    https
    .get(process.env.API_URL,(res)=>{
        if(res.statusCode === 200) console.log("Get sent successfully");
        else console.log("Get request failed",res.statusCode);
    })
    .on("error",(e) => console.error("Error while sending request",e));
})