const JWT = require('jsonwebtoken')
const secret = '1234'

function createToken(user){

    const payload = {
        _id : user._id,
        fullName : user.fullName,
        email : user.email,
        profileImageURL : user.profileImageURL || '/profile_pic.jpeg',
        role : user.role
    };

    const token = JWT.sign(payload, secret)
 
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token, secret)

    return payload;
}

module.exports = {
    createToken,
    validateToken
}