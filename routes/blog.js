const User = require('../models/user');
const express = require('express');
const multer = require('multer')
const path = require('path')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const router = express.Router();
const cloudinary = require("../services/cloudinary");

const storage = multer.diskStorage({
  filename: function (req,file,cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({storage: storage});

router.get('/addnew', (req, res) => {
    return res.render('addblog', {
        user : req.user
    })
})

router.post('/addnew', upload.single('coverImage'), async (req, res) => {

    cloudinary.uploader.upload(req.file.path, async function (err, result){
        if(err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Error"
            })
        }

        const { title, content } = req.body

        // console.log(req.file)
        
        await Blog.create({
            title,
            content,
            createdBy : req.user._id,
            coverImage : result.secure_url
        })

        res.redirect('/')
    })
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