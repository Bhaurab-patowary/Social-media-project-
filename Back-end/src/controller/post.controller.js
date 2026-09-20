const postModel = require('../models/post.model')

// const multer = require('multer')
const uploadFile = require('../services/storage.service');

async function CreatePostController(req, res) {
    try {
        const result = await uploadFile(req.file.buffer)

        const post = await postModel.create({
            image: result.url,
            caption: req.body.caption,
            user: req.user.id
        })

        res.status(200).json({
            message: "post created successfully",
            post 
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
}


async function postController(req, res) {
    try {
        const posts = await postModel.find().populate('user', 'username email avatar')

        res.status(200).json({
            message: "posts fetched successfully",
            posts
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch posts",
            error: error.message
        });
    }
}

async function postLikeController(req, res){
    const post = await postModel.findById(req.params.id);

    post.likes += 1;

    await post.save();

    res.status(200).json({
        likes: post.likes
    });
}

async function deletePostController(req, res) {
    try {
        const { id } = req.params;
        const post = await postModel.findById(id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check if the user is the owner of the post
        if (post.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "Unauthorized: You can only delete your own posts"
            });
        }

        await postModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Post deleted successfully",
            postId: id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to delete post",
            error: error.message
        });
    }
}

module.exports = {
    CreatePostController,
    postController,
    postLikeController,
    deletePostController
}