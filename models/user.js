const { createHmac , randomBytes } = require('crypto');
const {Schema, model} = require('mongoose');
const { createToken } = require('../services/auth'); 

const userSchema = new Schema({
    fullName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    salt : {
        type : String,
    },
    password : {
        type : String,
        required : true
    },
    profileImageURL : {
        type : String,
        default : "/profile_pic.jpeg"
    },
    role : {
        type : String,
        enum : ["user", "admin"],
        default : "user"
    }
},
{
    timestamps : true
}
);

userSchema.pre('save', function (next) {
    const user = this;

    if(!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashPass = createHmac('sha256', salt)
    .update(user.password)
    .digest('hex');

    this.salt = salt;
    this.password = hashPass;
})

userSchema.static('matchPassword', async function(email, password) {
    const user = await this.findOne({ email });

    console.log(user)

    if(!user) throw new Error('user not found');

    const salt = user.salt;
    const hashPass = user.password

    const hashPassAlt = createHmac('sha256', salt)
    .update(password)
    .digest('hex');

    if(hashPassAlt !== hashPass) throw new Error('user not found');

    const token = createToken(user)
    return token

    // return {...user, password : undefined, salt : undefined}
})

const User = model('user', userSchema)

module.exports = User;