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
        resolve();
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
}