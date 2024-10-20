const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routers/UserRouter");
const productRouter = require("./routers/ProductRouter");
const cloudinary = require("./utils/cloudinary")
require('dotenv').config()


const server = express();
const port = process.env.PORT || 8000;

server.use(express.json());
server.use(cors());

server.use("/user",userRouter);
server.use("/product",productRouter);


server.get("/",(req,res)=>{
    res.send("server is up");
})


mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});


server.listen(port,()=>{
    console.log(`Server running on port ${port}`);
})