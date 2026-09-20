const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    image: String,
    caption: String,
    likes: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

const postModel = mongoose.model("post", postSchema)

module.exports = postModel;