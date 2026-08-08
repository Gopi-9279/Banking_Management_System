require("dotenv").config()
const app = require("./src/app");
const connectToDB = require("./src/config/db.js");
connectToDB()


const port = 3000;
app.listen(port,()=>{
    console.log("server is running");
})