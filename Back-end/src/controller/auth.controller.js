const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const uploadFile = require("../services/storage.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        const isUserExist = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserExist) {
            return res.status(400).json({
                message: "User already exists with this username or email"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

           const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.cookie("token", token, { httpOnly: true });

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const isUserExist = await userModel.findOne({ email });

        if (!isUserExist) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            isUserExist.password
        );

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

         const token = jwt.sign(
            {
                id: isUserExist._id,
                username: isUserExist.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.cookie("token", token, { httpOnly: true });

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: isUserExist._id,
                username: isUserExist.username,
                email: isUserExist.email,
                bio: isUserExist.bio,
                avatar: isUserExist.avatar
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getProfileController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const posts = await postModel.find({ user: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            user,
            posts,
            postCount: posts.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

async function logoutController(req, res) {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (token) {
            await tokenBlacklistModel.create({ token });
        }

        res.clearCookie("token");

        return res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateProfileController(req, res) {
    try {
        const { username, bio } = req.body;
        const updateData = {};

        if (username) {
            const existingUser = await userModel.findOne({
                username,
                _id: { $ne: req.user.id }
            });
            if (existingUser) {
                return res.status(400).json({
                    message: "Username is already taken"
                });
            }
            updateData.username = username;
        }

        if (bio !== undefined) {
            updateData.bio = bio;
        }

        if (req.file) {
            const result = await uploadFile(req.file.buffer);
            updateData.avatar = result.url;
        } else if (req.body.avatar) {
            updateData.avatar = req.body.avatar;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    registerController,
    loginController,
    getProfileController,
    logoutController,
    updateProfileController
};