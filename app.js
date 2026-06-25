require('dotenv').config()
const express = require('express')
const path = require('path')
const userRoute = require('./routes/user')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const { checkForAuth } = require('./middlewares/authentication')
const blogRoute = require('./routes/blog')
const Blog = require('./models/blog')
const app = express()

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:');
    console.error(err);
});

const port = process.env.port || 8000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(port);
  })
  .catch(err => {
    console.error(err);
  });

console.log(process.env.MONGO_URL)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(checkForAuth('token'))
app.use(express.static(path.resolve('./public')))

app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))

app.get('/', async(req, res) => {

    const allb = await Blog.find({});
    res.render('home', {
        user : req.user,
        blogs : allb
    })
})

app.use('/user', userRoute)
app.use('/blog', blogRoute)

// app.listen(port, () => console.log('server connected'))