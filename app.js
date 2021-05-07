var express          = require("express");
var app              = express();
var bodyParser       = require("body-parser");
var mongoose         = require("mongoose");
var mOverride        = require("method-override");
var expressSanitizer  = require("express-sanitizer");

//setting the basics of app
mongoose.connect("mongodb://localhost/restful_blog_app",{ useNewUrlParser: true ,useUnifiedTopology: true})
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(mOverride("_method"));
app.use(expressSanitizer());

//creating the schema of the blog
var blogSchema = new mongoose.Schema({
    title:String,
    image: String,
    body: String,
    created: 
        {
            type: Date,
            default: Date.now
        }
});
var BlogModel= mongoose.model("BlogModel",blogSchema);




//    7 RESTFUL ROUTES 
//    ================

//        1. INDEX ROUTE
//        --------------
app.get("/",function(req,res){
    res.redirect("/blogs");
});  
app.get("/blogs",function(req,res){
    BlogModel.find({},function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs: blogs});
        }
    });
});

//         2. NEW ROUTE
//         ------------
app.get("/blogs/new",function(req,res){
    res.render("new")
});

//         3. CREATE ROUTE
//         ---------------
app.post("/blogs",function(req,res){
    //console.log(req.body);
    //sanitize the blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //console.log(req.body);
    //inserting a blog to database 
    BlogModel.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else{
            res.redirect("/blogs");
        }
    });
});

//           4. SHOW ROUTES
//           --------------
app.get("/blogs/:id",function(req,res){
    BlogModel.findById(req.params.id,function(err,found){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("show",{blog: found})
        }
    });
});

//            5. EDIT ROUTE
//            -------------
app.get("/blogs/:id/edit",function(req,res){
    BlogModel.findById(req.params.id,function(err,found){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit",{blog: found})
        }
    });
});


//            6. UPDATE ROUTE
//            ---------------
app.put("/blogs/:id",function(req,res){
    req.body.blog.body= req.sanitize(req.body.blog.body);
    //BlogModel.findByIdAndUpdate(id, new Data, callback function);
    BlogModel.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
        if(err){
            res.redirect("/index");
        } else{
            res.redirect("/blogs/"+req.params.id)
        }
    });
});


//            7. DESTROY ROUTE
//            ----------------
app.delete("/blogs/:id",function(req,res){
    //BlogModel.findByIdAndRemove(id, new Data, callback function);
    BlogModel.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs/"+req.params.id);
        } else{
            res.redirect("/");
        }
    });
});

//IP and listening oprt on server
app.listen(3000,"127.0.0.1",function(){
    console.log("the blog app is running");
});