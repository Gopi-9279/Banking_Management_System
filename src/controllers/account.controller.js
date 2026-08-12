const accountModel = require("../models/account.model")

async function createAccountController(req,res){
    const user = req.user;
    const AccountExitswithThisUserId = await accountModel.findOne({user : user._id});
    if(AccountExitswithThisUserId){
        return res.status(422).json({
            message : "Account exits with this user id",
            status : "failed"
        })
    }
    const account = await accountModel.create({
        user:user._id
    })
    res.status(201).json({
        account 
    })
}

async function getUserAccountsContoller(req,res) {
    const accounts = await accountModel.find({user:req.user._id})
    res.status(200).json({
        accounts
    })
}
async function getBalanceAccountsController(req,res){
    const {accountId} = req.params;
    const account = await accountModel.findOne({
        _id : accountId,
        user : req.user._id
    })
    if(!account){
        return res.status(404).json({
            message : "Account not found"
        })
    }
    const balance = await account.getBalance();
    res.status(200).json({
        accountId : account._id,
        balance : balance
    })
}

module.exports = {
    createAccountController,
    getUserAccountsContoller,
    getBalanceAccountsController
}