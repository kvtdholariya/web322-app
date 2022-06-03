/********************************************************************************* * 
 * WEB322 – Assignment 02 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source * (including 3rd party web sites) or distributed to other students. 
 * * * Name: Kavitaben Dholariya
 * Student ID: 010935153
 * Date: 02/06/2022
 * Online (Heroku) Link: https://stark-tundra-29140.herokuapp.com/  
 * * ********************************************************************************/
 var express = require("express");
 var app = express();
 var path= require("path");
 var blogService = require("./blog-service.js");
 var HTTP_PORT = process.env.PORT || 8080;
 
 function onHttpStart() {
 
     console.log("Express http server listening on "+ HTTP_PORT);
     return new Promise(function(reslove, reject){
         blogService.initialize().then(function(value){
             console.log(value);
         }).catch(function(reason){
                 console.log(reason);
             });
     });
 }
 
 app.use(express.static('public'));
 
 app.get("/", (req, res) => {
     res.sendFile(path.join(__dirname, "/views/about.html"));
 });
 
 app.get("/blog", (req, res) =>{
     blogService.getAllPosts().then((data)=>{
         res.json(data);
     }).catch((error)=>{
         res.json({message, error})
     });
     
 });
 
 app.get("/posts", (req, res)=> {
     blogService.getPublishedPosts().then((data)=>{
         res.json(data);
     }).catch((error)=>{
         res.json({message, error})
     });
     
 });
 
 
 app.get("/categories", (req,res)=>{
    
    blogService.getCategories().then((data)=>{
         res.json(data);
    }).catch((err)=>{
        res.json({message: err});
    });
 
  });
 
 app.use((req, res)=>{
     res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
 });
 
 app.listen(HTTP_PORT, onHttpStart);