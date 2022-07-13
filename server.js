/********************************************************************************* * 
 * WEB322 – Assignment 04 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source * (including 3rd party web sites) or distributed to other students. 
 * * * Name: Kavitaben Dholariya
 * Student ID: 010935153
 * Date: 7/5/2022
 * Online (Heroku) Link: https://fierce-ridge-11059.herokuapp.com/
 * * ********************************************************************************/

//assignment#2
//modified var to const in assignment 3
const express = require("express");
const app = express();
//modified var to const in assignment 4
const path = require("path");
const blogService = require("./blog-service.js");
const HTTP_PORT = process.env.PORT || 8080; //modified var to const in assignment 4
//assignment#3
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
//assignment#4
const exphbs = require("express-handlebars"); //Step 1-->"require" it as exphbs
const blogData = require("./blog-service"); //Assignment#4 Part 4 Step 3
const stripJs = require('strip-js');//Part 4 Step 1


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
    return new Promise(function(reslove, reject){
        blogService.initialize().then(function(value){
            console.log(value);
        }).catch(function(reason){
                console.log(reason);
            });
    });
}
app.use(express.static('public'));
//Assignment#5 include the regular express.urlencoded() middleware
app.use(express.urlencoded({extended: true}));

//Assignment#4
//Step 1 add the app.engine() code using exphbs.engine({ … }) and the "extname" property as ".hbs"
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",//the "extname" property as ".hbs"
    defaultLayout: "main",
    //Step 4 adding helpers
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
            },
        //Step 4 adding helpers
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        //Part 4 Step 1
        safeHTML: function (context) {
            return stripJs(context);
        },
        //Assignment#5 added helper 
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
            }
    }
}));



//Assignment#4
//Step 1 call app.set() to specify the 'view engine'
app.set("view engine", ".hbs");
app.set('views', './views');
 
//Assignment#4 below function is given by professor 
//Step 4 middleware
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
    });
    
//add redirect in the assignment 3
app.get("/",  (req, res)=> {
    res.redirect("/blog"); //Assignment#4 Finally, as the last step before completing the assignment, update your default "/" route to redirect to "/blog" instead of "/about"
});
//Assignment#4 changed about.html to about.hbs
app.get("/about", (req, res) => {
    res.render(path.join(__dirname, "/views/about.hbs"));//Step 2 change the GET route for "/about" to "render" the "about" view, instead of sending about.html
});

//Assignment#4
app.get("/posts/add", (req, res) => {
    res.render(path.join(__dirname, "./views/addPost.hbs"));//Step 3 Modify the corresponding GET route (ie: "/post/add") to "res.render" the appropriate .hbs file, instead of using res.sendFile
})

//Assignment#4 given code 
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

//Assignment#4
app.get('/blog/:id', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        const post = await getPostById(req.params.id);
        viewData.post = post[0]
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
  
    res.render("blog", {data: viewData})
});
//assignment#4
//Part 2 Step 1
app.get("/posts", async(req, res) => {
    let category = req.query.category;
    let minDate = req.query.minDate;
//Assignemnt#5 logic modifed for res.render()
    if (category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0)
            {
                res.render("posts", { posts: data });
            }
            else
            {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
    else if (minDate != "" && minDate != null) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0)
            {
                res.render("posts", { posts: data });
            }
            else
            {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
    else {
        blogService.getAllPosts().then((data) => {
            if (data.length > 0)
            {
                res.render("posts", { posts: data });
            }
            else
            {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
});

//Assignment#4 
//Part 3 Step 1

app.get("/categories", async(req, res) => {
    blogService.getCategories().then(data => {
        //Assignemnt#5 logic modifed for res.render()
        if (data.length > 0)
        {
            res.render("categories", { categories: data });
        }
        else
        {
            res.render("categories", { message: "no results" });
        }
    }).catch((err) => {
        res.render("categories", { message: err });
    })
});


app.get('/posts/add',function(req,res) {
    //modifed in the assignment#5
    blog.getCategories().then(data=>{
        res.render("addPost", {categories: data});
    }).catch(err=>{
        res.render("addPost", {categories: []});
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
        const { title, body, category, published, featureImage  } = req.body;
         postData = {
             title, body, category, published, featureImage
         }
         addPost(postData).then((data) => {
             res.json(data)
         }).catch((err)=> {
             console.log(err);
         })
    });
})
app.get('/posts/:value', async (req,res)=> {
    blogService.getPostById(req.params.value).then((posts) => {
        res.json(posts);
    }).catch((err)=> {
        console.log(err);
    })
})
//added below routes in assignment#5
app.get("/categories/add", (req,res)=>{
    res.render("addCategory"); //route to "render" an "addCategory"
});

app.post("/categories/add", (req,res)=>{
    blogService.addCategory(req.body).then((data)=>{
        res.redirect("/categories");
    });
});

app.get("/categories/delete/:id", (req,res)=>{
    blogService.deleteCategoryById(req.params.id).then((data)=>{
        res.redirect("/categories");
    }).catch(err=>{
        res.status(500).send("Unable to Remove Category / Category Not Found");
    });
});

app.get("/posts/delete/:id", (req,res)=>{
    blogService.deletePostById(req.params.id).then((data)=>{
        res.redirect("/posts");
    }).catch(err=>{
        res.status(500).send("Unable to Remove Post / Post not found)");
    });
});

/*
app.use((req, res)=>{
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
}); */

app.use((req, res) => {
    res.status(404).render("404");
});


app.listen(HTTP_PORT, onHttpStart);

