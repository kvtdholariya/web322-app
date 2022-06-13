/********************************************************************************* * 
 * WEB322 – Assignment 03 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source * (including 3rd party web sites) or distributed to other students. 
 * * * Name: Kavitaben Dholariya
 * Student ID: 010935153
 * Date: 10/06/2022
 * Online (Heroku) Link: https://fierce-ridge-11059.herokuapp.com/
 * * ********************************************************************************/

//assignment#2
//modified var to const in assignment 3
const express = require("express");
const app = express();
var path = require("path");
const blogService = require("./blog-service.js");
var HTTP_PORT = process.env.PORT || 8080;
//assignment#3
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const { resolve } = require("path");
//Seting the cloudinary config
cloudinary.config({
    cloud_name: 'kavitacloud',
    api_key: '888119983429588',
    api_secret: 'ywMazgS2Bx-90LwxzRuYkYYCMEM',
    secure: true
});
//createing an "upload" variable without any disk storage,
const upload = multer(); // no { storage: storage } since we are not using disk storage
onHttpStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
    return new Promise (reslove, reject)=()=> {
        blogService.initialize().then(function (value) {
            console.log(value);
        }).catch(function (reason) {
            console.log(reason);
        });
    };
}
app.use(express.static('public'));
//add redirect in the assignment 3
app.get("/",  (req, res)=> {
    res.redirect("/about");
});

app.get("/about",  (req, res) =>{
    res.sendFile(path.join(__dirname, "./views/about.html"));
});

app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/addPost.html"));
})

app.get("/blog", (req, res) => {
    blogService.getAllPosts().then((data) => {
        res.json(data);
    }).catch((error) => {
        res.json({ message, error })
    });

});
//assignment#2
/*
app.get("/posts", (req, res) => {
    blogService.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((error) => {
        res.json({ message, error })
    });

}); */
//assignment#3
app.get("/posts", function (req, res) {

    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            res.json(data);
        }).catch(function (error) {
            res.json({ error });
        });
    }
    else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json(data);
        }).catch(function (error) {
            res.json({ error});
        });
    }
    else {
        blogService.getAllPosts().then((data) => {
            res.json(data);
        }).catch(function (error) {
            res.json({ error });
        });
    }
});

app.get('/posts/:value', (req, res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.json(data);
    }).catch(function (error) {
        res.json({ error });
    });
})


app.get("/categories", (req, res) => {

    blogService.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({ message: error });
    });

});

//added below assignment 3 from the given document

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        //added here 
        blogService.addPost(req.body);
        res.redirect("/posts");
    });
})
app.use((req, res)=>{
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
});

app.listen(HTTP_PORT, onHttpStart);

