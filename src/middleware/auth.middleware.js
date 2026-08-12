const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const tokenblackListModel = require("../models/blackList.model.js");
async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }


  const isBlackListed = await tokenblackListModel.findOne({token})

  if(isBlackListed){
    return res.status(401).json({
      message : " UnAuthorized token is invalid"
    })
  }



  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({
      message: `Unauthorized access, token invalid`,
    });
  }
}

async function authSystemUserMiddleware(req,res,next){
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
  if(!token){
    return res.status(401).json({
      message : "Unauthrized access, token is missing"
    })
  }
  const isBlackListed = await tokenblackListModel.findOne({token})

  if(isBlackListed){
    return res.status(401).json({
      message : " UnAuthorized token is invalid"
    })
  }
  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const user = await userModel
    .findById(decoded.userId)
    .select("+systemUser")
    if(!user.systemUser){
      return res.status(403).json({
        message : "Forbiden access, not a system user"
      })
    }
    req.user = user 

    return next()
  }catch(err){
    return res.status(401).json({
      message : `Unauthorized access, token is invalid`
    })
  }

}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}