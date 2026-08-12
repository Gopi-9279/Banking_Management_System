const mongoose = require("mongoose");


const tokenblackListSchema = new mongoose.Schema({
    token : {
        type : String,
        required : [true,"Token is required to blacklist"],
        unique : [true,"Token is already blackListed"]
    }
},{timestamps:true });


tokenblackListSchema.index({createdAt : 1},{expireAfterSeconds:60*60*24*3})
const tokenblackListModel = new mongoose.model("tokenblacklist",tokenblackListSchema);

module.exports = tokenblackListModel;