const express = require("express");
const authContoller = require("../controllers/auth.controller.js")

const router = express.Router()
/* POST /api/auth/register */
router.post("/register",authContoller.userRegistrationController)

/* POST /api/auth/login */
router.post("/login",authContoller.userLoginController)


 /**
  * - POST /api/auth/logout
  */

 router.post("/logout",authContoller.userLogOutController)

module.exports = router