/********************************************************************************* * 
 * WEB322 – Assignment 06 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has been copied manually or electronically from any other source * (including 3rd party web sites) or distributed to other students. 
 * * * Name: Kavitaben Dholariya
 * Student ID: 010935153
 * Date: 7/19/2022
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
//const blogData = require("./blog-service"); //Assignment#4 Part 4 Step 3
const stripJs = require('strip-js');//Part 4 Step 1
//Assignment#6
const authData = require("./auth-service.js");
const clientSessions = require("client-sessions");



//Seting the cloudinary config
cloudinary.config({
    cloud_name: 'kavitacloud',
    api_key: '888119983429588',
    api_secret: 'ywMazgS2Bx-90LwxzRuYkYYCMEM',
    secure: true
});
//createing an "upload" variable without any disk storage,
const upload = multer(); // no { storage: storage } since we are not using disk storage

/*
onHttpStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
    return new Promise(function (reslove, reject) {
        blogService.initialize().then(function (value) {
            console.log(value);
        }).catch(function (reason) {
            console.log(reason);
        });
    });
}
*/
//Assignment# 6
blogService.initialize().then(authData.initialize)
.then(function(){
app.listen(HTTP_PORT, function(){
console.log("app listening on: " + HTTP_PORT)
});
}).catch(function(err){
console.log("unable to start server: " + err);
}); 
app.use(express.static('public'));

//Assignment#5 include the regular express.urlencoded() middleware
app.use(express.urlencoded({ extended: true }));

//Assignment#6
app.use(clientSessions( {
    cookieName: "session",
    secret: "Kavita-06",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

//Assignment#4
//Step 1 add the app.engine() code using exphbs.engine({ … }) and the "extname" property as ".hbs"
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",//the "extname" property as ".hbs"
    defaultLayout: "main",
    //Step 4 adding helpers
    helpers: {
        navLink: function (url, options) {
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
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));

//Assignment#4
//Step 1 call app.set() to specify the 'view engine'
app.set("view engine", ".hbs");
app.set('views', './views');

//Assignment#4 below function is given by professor 
//Step 4 middleware
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
    });

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
}
//add redirect in the assignment 3
app.get("/", (req, res) => {
    res.redirect("/blog"); //Assignment#4 Finally, as the last step before completing the assignment, update your default "/" route to redirect to "/blog" instead of "/about"
});
//Assignment#4 changed about.html to about.hbs
app.get("/about", (req, res) => {
    res.render(path.join(__dirname, "/views/about.hbs"));//Step 2 change the GET route for "/about" to "render" the "about" view, instead of sending about.html
});
//Assignment#4 given code
//ensureLogin added 
app.get('/blog/:id', ensureLogin, async (req, res) => {

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

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
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

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogService.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogService.getPublishedPosts();
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
        let categories = await blogService.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {viewData: viewData})
});
//assignment#4
//Part 2 Step 1
//ensureLogin added
app.get("/posts", ensureLogin, (req, res) => {
    let category = req.query.category;
    let minDate = req.query.minDate;
    //Assignemnt#5 logic modifed for res.render()
    if (category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
    else if (minDate != "" && minDate != null) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
    else {
        blogService.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            }
            else {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
});
app.get('/posts', (req, res) => {
    //Assignemnt#5 logic modifed for res.render()
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
            .then((data) => {
                res.render("posts", { posts: data });
            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    }
    else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.json(err);
            })
    }
    else {
        blogService.getAllPosts()
            .then((data) => {
                if (data.length > 0)
                    res.render("posts", { posts: data });
                else
                    res.render("posts", { message: "no results" });
            })
            .catch(() => {
                res.render("posts", { message: "no results" });
            })
    }
});
//const upload = multer();
//added below assignment 3 from the given document
app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream((error, result) => {
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
        console.log("server: ", req.body);
        blogService.addPost(req.body).then(() => {
            res.redirect('/posts')
        }).catch((error) => {
            res.status(500).send(error)
        });
    });
});
//ensureLogin added 
app.get('/posts/add', ensureLogin, (req, res) => {
    //modifed in the assignment#5
    blogService.getCategories()
        .then(data => res.render("addPost", { categories: data }))
        .catch(err => res.render("addPost", { categories: [] }));
});
//ensureLogin added
app.get('/post/:value', ensureLogin,(req, res) => {
    blogService.getPostById(req.params.value)
        .then((data) => {
            res.json({ data });
        })
        .catch((err) => {
            res.json(err);
        })

});
//Assignment#4 
//Part 3 Step 1
app.get('/categories', ensureLogin, (req, res) => {
    blogService.getCategories().then((data) => {
        // //Assignemnt#5 logic modifed for res.render()
        if (data.length > 0)
            res.render("categories", { categories: data });
        else
            res.render("categories", { message: "no results" });
    })
        .catch(() => {
            res.render("categories", { message: "no results" });
        })
});
//added below routes in assignment#5
//Assignment#6 ensureLogin added
app.get('/categories/add', ensureLogin, (req, res) => {
    res.render("addCategory"); //route to "render" an "addCategory"
});
//ensureLogin added
app.post('/categories/add',ensureLogin, (req, res) => {
    blogService.addCategory(req.body)
        .then(() => {
            res.redirect("/categories");
        });
});
//ensureLogin added
app.get('/categories/delete/:id', ensureLogin,(req, res) => {
    blogService.deleteCategoryById(req.params.id)
        .then(() => {
            res.redirect("/categories");
        }).catch((err) => {
            res.status(500).render("categories", {
                errorMessage: "Unable to Remove Category / Category Not Found"
            });
        });
});
//ensureLogin added 
app.get('/posts/delete/:id', ensureLogin, (req, res) => {
    blogService.deletePostById(req.params.id)
        .then(() => {
            res.redirect("/posts");
        }).catch((err) => {
            res.status(500).render("posts", {
                errorMessage: "Unable to Remove Post / Post Not Found"
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});


app.post("/register", (req,res) => {
    authData.registerUser(req.body)
    .then(() => res.render("register", {successMessage: "User created" } ))
    .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});


app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email,  // authenticated user's email
            loginHistory: user.loginHistory // authenticated user's loginHistory
        }
        res.redirect('/posts');
    }).catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

/*app.use((req, res)=>{
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
});*/
app.use((req, res) => {
    res.status(404).render("404");
});
//app.listen(HTTP_PORT, onHttpStart);
