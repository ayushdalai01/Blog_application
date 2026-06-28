const User = require('../models/user');
const express = require('express');
const multer = require('multer');
const path = require('path')
const router = express.Router();
const { createToken } = require('../services/auth');
const Blog = require('../models/blog')
const cloudinary = require("../services/cloudinary");

const storage = multer.diskStorage({
  filename: function (req,file,cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({storage: storage});

router.get('/signin', (req, res) => {
    return res.render('signin')
})

router.post('/signin', async (req, res) => {
    const {email, password} = req.body

    try{

        const token = await User.matchPassword(email, password);

        return res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax'
        }).redirect('/');
    }
    catch(error){
        return res.render('signin', {
            error : 'INCORRECT EMAIL OR PASSWORD'
        })
    }
})

router.get('/signup', (req, res) => {
    return res.render('signup')
})

router.post('/signup', upload.single('profileImageURL'), async (req, res) => {

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    const user = {
        fullName,
        email,
        password,
    }

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        user.profileImageURL = result.secure_url;
    }

    const new_user = await User.create(user);

    const token = createToken(new_user);

    return res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax'
    }).redirect('/');

})

router.get('/myblog', async(req, res) => {

    const blogs = await Blog.find({
        createdBy : req.user._id
    })

    res.render('myblog', {
        blogs,
        user : req.user // we need to pass the user so that nav can acces it
    })
})

router.post('/myblog/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting blog');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/')
})



module.exports = router