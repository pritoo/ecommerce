const app = require('./app');
const dotenv =require('dotenv');
const connectDatabase =require ('./config/database')

//uncaught error
process.on("uncaughtException",(err)=>{
   console.log(`Error: ${err.message}`);
   console.log(`shutting down the server due to uncaughtException`);
   process.exit(1);
})
//console.log(youtube)
//config
dotenv.config({path:"ecommerce-backend/config/config.env"});

console.log(process.env.PORT)

//connect to database
connectDatabase();
//console.log(process.env.PORT);
const server = app.listen(process.env.PORT,()=>{
   console.log(`server is running on http://localhost:${process.env.PORT}`) 
})


//unhandled promise rejection

process.on("unhandledRejection",(err)=>{
   console.log(`Error: ${err.message}`,"hello");
   console.log(`shutting down the server due to unhandled promise rejection`)

   server.close(()=>{
      process.exit(1);
   });
});
