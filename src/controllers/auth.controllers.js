const userModel = require("../models/user.model.js")
const emailService = require("../services/email.service.js");
const jwt = require("jsonwebtoken");
/** 
* - user register controller
* - POST /api/auth/register
*/

async function userRegistrationController(req,res){
    const {email,name,password} = req.body
    const isExits = await userModel.findOne({
        email:email
    }) 
    if(isExits){
        return res.status(422).json({
            message : "User already exits with this email",
            status : "failed"

        })
    }
    const user = await userModel.create({
        email,name,password
    })
    // Jwt token denge for account creation
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
    res.cookie("token",token)

    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })


    await emailService.sendRegistrationEmail(user.email,user.name)
}
/** 
* - user Login controller
* - POST /api/auth/login
*/
async function userLoginController(req,res){
    const {email,password} = req.body
    const user = await userModel.findOne({email}).select("+password")
    if(!user){
        return res.status(401).json({
            message : "Email or password is Invalid"

        })
    }
    const isvalidPassword = await user.comparePassword(password)

    if(!isvalidPassword){
        return res.status(401).json({
            message : "password is invalid"
        })
    }
    // Jwt token denge for account creation
    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
    res.cookie("token",token)

    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    }) 
}
module.exports = {
    userRegistrationController,
    userLoginController
}