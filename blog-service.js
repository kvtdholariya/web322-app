//reference from the week 7 notes 
//Added in assignment#5 code given in the assigmnet document

const Sequelize = require('sequelize');
var sequelize = new Sequelize('d5io17heisf99i', 'irofefsmalkitf', '48ef935be9d230c22e1b285370efed85c121b03e67e97a254a5b625fd0652358', {
    host: 'ec2-34-200-35-222.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
        },
        query: { raw: true }
        });
//reference from the week 7 notes 
//Added in assignment#5
var Post = sequelize.define("Post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});
//reference from the week 7 notes
//Added in assignment#5
var Category = sequelize.define("Category", {
    category: Sequelize.STRING
});
//belongsTo Relationship
Post.belongsTo(Category, {foreignKey: 'category'});


module.exports.initialize =  () =>{
    return new Promise((resolve, reject) => {
        //This function will invoke the sequelize.sync() function
        sequelize.sync().then(()=>{
            resolve();
        }).catch(err=>{
            reject("unable to sync the database");
        });
    });
};

module.exports.getAllPosts =  ()=>{
    return new Promise((resolve, reject) => {
        //This function will invoke the Post.findAll() function
        Post.findAll().then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPublishedPosts =  ()=> {
    return new Promise((resolve, reject) => {
        //This function will invoke the Post.findAll() function and
        Post.findAll({
            where: {
                published: true
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getCategories =  () =>{
    return new Promise((resolve, reject) => {
        Category.findAll().then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.addPost =  (postData)=> {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (var prop in postData)
        {
            if (postData[prop] === "")
            {
                postData[prop] = null;
            }
        }
        postData.postDate = new Date();

        Post.create({
            body: postData.body,
            title: postData.title,
            postDate: postData.postDate,
            featureImage: postData.featureImage,
            published: postData.published,
            category: postData.category
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("unable to create post");
        });
    });
};

module.exports.getPostsByCategory =  (category)=>{
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPostsByMinDate =  (minDateStr) =>{
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then(data=>{
            resolve(data[0]);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPublishedPostsByCategory =  (category) =>{
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};
//below three functions Added in assignment#5 to allow our users to add Categories and delete Posts and Categories
module.exports.addCategory =  (categoryData)=> {
    return new Promise((resolve, reject)=>{
        for (var prop in categoryData)
        {
            if (categoryData[prop] === "")
            {
                categoryData[prop] = null;
            }
        }

        Category.create({
            category: categoryData.category
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("unable to create category");
        });
    });
}

module.exports.deleteCategoryById =  (id)=> {
    return new Promise((resolve, reject)=>{
        Category.destroy({
            where: {
                id: id
            }
        }).then(()=>{
            resolve();
        }).catch(err=>{
            reject();
        });
    });
}

module.exports.deletePostById =  (id) =>{
    return new Promise((resolve, reject)=>{
        Post.destroy({
            where: {
                id: id
            }
        }).then(()=>{
            resolve();
        }).catch(err=>{
            reject();
        });
    });
}