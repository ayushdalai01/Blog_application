const User = require('../models/user');
const express = require('express');
const multer = require('multer');
const path = require('path')
const router = express.Router();
const { createToken } = require('../services/auth');
const Blog = require('../models/blog')
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router.get('/signin', (req, res) => {
    return res.render('signin')
})

router.post('/signin', async (req, res) => {
    const {email, password} = req.body

    try{

        // const token = await User.matchPassword(email, password)

        // // console.log('token : ', token)
        // return res.cookie(token).redirect('/')

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
    // const { fullName, email, password } = req.body;

    // console.log(fullName);
    // console.log(req.body);

    // if (!fullName || !email || !password) {
    //     return res.status(400).send('All fields are required');
    // }

    // await User.create({
    //     fullName,
    //     email,
    //     password,
    //     profileImageURL : `/uploads/${req.file.filename}`
    // });

    // return res.redirect('/');

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    // const profileImageURL = req.file
    //     ? `/uploads/${req.file.filename}`
    //     : undefined;

    // const profileImageURL = req.file ? req.file.secure_url : undefined

    try{
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageURL : req.file?.path
        });

        const token = createToken(user);

        return res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax'
        }).redirect('/');

    } catch (err){
        console.log('error : ', err);
    }
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