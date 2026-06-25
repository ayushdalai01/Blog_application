const User = require('../models/user');
const express = require('express');
const multer = require('multer')
const path = require('path')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const router = express.Router();
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

router.get('/addnew', (req, res) => {
    return res.render('addblog', {
        user : req.user
    })
})

router.post('/addnew', upload.single('coverImage'), async (req, res) => {

    const { title, content } = req.body

    // console.log(req.file)
    
    await Blog.create({
        title,
        content,
        createdBy : req.user._id,
        coverImage : req.file?.path
    })

    res.redirect('/')
    
})


router.get('/:id', async (req, res) => {

    // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    //     return res.status(404).send('Blog not found');
    // }

    const blogx = await Blog.findById(req.params.id).populate('createdBy')

    const commentsx = await Comment.find({ blogId : req.params.id }).populate(
        'createdBy'
    );

    return res.render('blog', {
        user : req.user,
        blog : blogx,
        comments : commentsx
    })
})

router.post('/comment/:blogId', async (req, res) => {

    const comment = await Comment.create({
        content : req.body.content,
        blogId : req.params.blogId,
        createdBy : req.user._id
    })

    return res.redirect(`/blog/${req.params.blogId}`)
})

module.exports = router