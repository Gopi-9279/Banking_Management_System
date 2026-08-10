const {transactionModel} = require("../models/transaction.model.js");
const {ledgerModel} = require("../models/ledger.model.js");
const accountModel = require("../models/account.model.js");
const mongoose = require("mongoose");
const emailService = require("../services/email.service.js");
const { promises } = require("nodemailer/lib/xoauth2/index.js");

/** 

 *  - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
    * 1. Validate request
    * 2. Validate idempotency key
    * 3. Check account status
    * 4. Derive sender balance from ledger
    * 5. Create transaction (PENDING)
    * 6. Create DEBIT ledger entry
    * 7. Create CREDIT ledger entry
    * 8. Mark transaction COMPLETED
    * 9. Commit MongoDB session
    * 10. Send email notification

*/

async function createTransaction(req, res) {
  /**
   * 1.Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount,toAccount,amount and idempotencyKey are required",
    });
  }

  const fromuserAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  const touserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!fromuserAccount || !touserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }
  /**
   * 2.Validate idempotencyKey
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already process",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed previosly, please retry",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction processing failed previosly, please retry",
      });
    }
  }
  /**
   * 3.Check account status
   */
  if (
    fromuserAccount.status !== "ACTIVE" ||
    touserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be active to process transaction",
    });
  }
  /**
   * 4.Derive sender balance from ledger
   */
  const balance = await fromuserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount} `,
    });
  }
  /**
   * 5.Create Transaction(Pending)
   */
  const session = await mongoose.startSession()
  session.startTransaction();

  const transaction = new transactionModel(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    }
  );

  const debitLedgerEntry = await ledgerModel.create(
    [{
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    }],
    { session },
  );

  await (()=>{
    return new Promise((resolve)=>{
      setTimeout(resolve,100*1000);
    })
  })()

  const creaditLedgerEntry = await ledgerModel.create(
    [{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    }],
    { session },
  );

  ((transaction.status = "COMPLETED"), await transaction.save({ session }));
  session.endSession()
    /**
   * 10.Send Email Notification
   */  
  await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount)
  
  return res.status(201).json({
    message : "Transaction completed successfully",
    transaction : transaction
  })
}
async function createInitialFundsTransaction(req,res) {
  const {toAccount,amount,idempotencyKey} = req.body

  if(!toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message : "toAccount , amount and idempotencyKey are required"
    })
  }
  const touserAccount = await accountModel.findOne({
    _id : toAccount,
  })
  if(!touserAccount){
    return res.status(400).json({
      message : "Invalid toAccount"
    })
  }
  const fromuserAccount = await accountModel.findOne({
    user : req.user._id
  })
  if(!fromuserAccount){
    return res.status(400).json({
      message : "System user account not found"
    })
  }
  const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = new  transactionModel({
    fromAccount : fromuserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status : "PENDING",
  })
  const debitLedgerEntry = await ledgerModel.create(
   [ {
      account: fromuserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    }],
    { session },
  );
  const creditLedgerEntry = await ledgerModel.create(
  [  {
      account: touserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    }],
    { session },
  );
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction()
  session.endSession()
  return res.status(201).json({
    message : "Initial transaction completed successfully",
    transaction : transaction
  })
}
module.exports ={
  createTransaction,
  createInitialFundsTransaction
}
