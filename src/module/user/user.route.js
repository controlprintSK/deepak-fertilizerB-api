const express = require("express");
const validate = require("../../middlewares/validate");
// const multer = require("multer");
const userValidation = require("./user.validation");
const userController = require("./user.controller");
const { User } = require("./user.model");
const auditMiddleware = require("../../middlewares/auditsTrail");
const auditsFilter = require("../../utils/audits_Trail_Filter");
const { passwordPolicySchema } = require('../passwordPolicy/passwordPolicy_model');
// const fs = require("fs");
const router = express.Router();

const auth = require("../../middlewares/auth");
const getDBConnection = require("../../db/dbDynamicConnection");
const createModel = async (req, res, next) => {
  if (!req.headers['company']) {
    req.headers['company'] = "MAIN"
  }
  let dbName = req.headers['company'];
  let conn = await getDBConnection(dbName);
  const PasswordPolicy = conn.model("PasswordPolicy",passwordPolicySchema,"coll_password_policy");
  req.body.schema = { PasswordPolicy };
  next();
};


router.post(
  "/",
  auth(30, 1),
  validate(userValidation.getUsers),
  userController.getUsers
);
router.post(
  "/create-user",
  auth(30, 2),
  auditMiddleware.auditMiddleware(User, auditsFilter.createUserFilter),
  validate(userValidation.createUser),
  createModel,
  userController.createUser
);

router
  .route("/:userId")
  .get(auth(30, 1), validate(userValidation.getUser), userController.getUser)
  .put(
    auth(30, 3),
    auditMiddleware.auditMiddleware(User, auditsFilter.updateUserFilter),
    validate(userValidation.updateUser),
    createModel,
    userController.updateUser
  )
  .delete(
    auditMiddleware.auditMiddleware(User, auditsFilter.deleteUserFilter),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

router.post(
  "/getUserSuperAdmin",
  auth(30, 1),
  userController.getUserSuperAdmin
);

router.post("/getUsersByCode", auth(30, 1), userController.getUserByCode);

router.put(
  "/changeActiveUser/:userId",
  auth(30, 3),
  // auditMiddleware.auditMiddleware(User, auditsFilter.userStatusChange),
  validate(userValidation.updateActive),
  userController.changeActiveUser
);

router.put(
  "/unlockUser/:UserId",
  auth(30, 3),
  // auditMiddleware.auditMiddleware(User, auditsFilter.unlockUserFilter),
  validate(userValidation.unlockUser),
  userController.unlockUser
);

module.exports = router;
