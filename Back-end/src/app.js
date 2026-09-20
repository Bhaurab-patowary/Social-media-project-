const express = require('express')
// const multer = require('multer')
// const uploadFile = require('./services/storage.service');
// const postModel = require("./models/post.model")
// const userModel = require("./models/user.model")

const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// const upload = multer({storage: multer.memoryStorage()})
const authRouter = require('./routes/auth.route')
const postRouter = require('./routes/post.route')


app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)


// app.post('/register', async (req, res)=>{
//     const {username, email, password} = req.body

//     const user = await userModel.create({
//         username,
//         email,
//         password
//     })

//     res.status(201).json({
//         message: "User registered successfully",
//         user
//     })
// })

// app.post('/login', async (req, res)=>{

//     const {email, password} = req.body

//     if(!email || !password) {
//         return res.status(400).json({
//             massage : "please provide valid email or password" 
//         })
//     }

//     const isUserExist = await userModel.findOne({email})


// })

// app.post('/create-post', upload.single("image"), async (req, res)=>{

//     const result = await uploadFile(req.file.buffer)

//     // console.log("image url:",result.url)

//     const post = await postModel.create({
//         image: result.url,
//         caption: req.body.caption
//     })

//     res.status(200).json({
//         massage : "post created successfully",
//         post 
//     })
// })

// app.get("/posts", async (req, res)=> {
//     const posts = await postModel.find()

//     res.status(201).json({
//         massage: "post fatched successfuly",
//         posts
//     })
// })

// app.patch("/posts/:id/like", async (req, res) => {
//     const post = await postModel.findById(req.params.id);

//     post.likes += 1;

//     await post.save();

//     res.status(200).json({
//         likes: post.likes
//     });
// });

module.exports = app