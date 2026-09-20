const mongoose = require('mongoose');

async function connectDB() {
    await mongoose.connect("mongodb+srv://yt:0E7i4PjXzOCMGE82@back-end-project.mhf2n3m.mongodb.net/project-D")
    
    console.log("connected top db")
}

module.exports = connectDB