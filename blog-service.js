const res = require('express/lib/response');
const fs = require("fs"); 
var posts = [];
var categories = [];

module.exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        fs.readFile('./data/posts.json', (err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                posts = JSON.parse(data);
            }
        });

        fs.readFile('./data/categories.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                categories = JSON.parse(data);
            }
        })
        resolve("File read.");
    })
};
module.exports.getAllPosts = () => {
    return new Promise ((resolve,reject) => {
        if (posts.length === 0) {
            reject('no results returned');
        }
        else {
            resolve(posts);
        }
    })
};
module.exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        var publishPost = posts.filter(post => post.published == true);
        if (publishPost.length === 0) {
            reject('no results returned');
        }
        resolve(publishPost);
    })
};
module.exports.getCategories = () => {
    return new Promise((resolve,reject) => {
        if (categories.length === 0) {
            reject ('no results returned');
        }
        else {
            resolve (categories);
        }
    })
};

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        if(!postData.published) postData.published  = false;//If postData.published is undefined, explicitly set it to false,
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve(postData);
    })
};


module.exports.getPostsByCategory = (category) =>{
    let ans = [];
    return new Promise((resolve, reject) => {
        posts.forEach(post => {
            if(post.category == category){
                ans.push(post);
            }
        });
        resolve(ans);
    })
}

module.exports.getPostsByMinDate = (minDateStr) => {
    let ans = [];
    return new Promise((resolve, reject) => {
        posts.forEach(post => {     
            if(new Date(post.postDate) >= new Date(minDateStr)){
                ans.push(post);
            }
        });
        resolve(ans);
    })
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        posts.forEach(post => {     
            if(post.id == id)
                resolve(post);
        });
    })
}