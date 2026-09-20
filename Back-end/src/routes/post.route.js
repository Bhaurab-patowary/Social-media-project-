const { Router } = require('express')
const  upload= require('../middleware/upload.middleware')
const { authUser } = require ('../middleware/auth.middleware')
const postController = require('../controller/post.controller')
const postRoute = Router()

// postRoute.post('/create-post', upload.single("image"), postController.CreatePostController)

// postRoute.get('/posts', postController.postController)

// postRoute.patch("/posts/:id/like", postController.postLikeController)

postRoute.post('/', upload.single("image"), authUser, postController.CreatePostController)

postRoute.get('/', postController.postController)

postRoute.patch("/:id/like", postController.postLikeController)

postRoute.delete("/:id", authUser, postController.deletePostController)

module.exports = postRoute