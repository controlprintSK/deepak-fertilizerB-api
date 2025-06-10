const express = require("express");
const validate = require("../../middlewares/validate");
const auditMiddleware = require("../../middlewares/auditsTrail");
const auditsFilter = require("../../utils/audits_Trail_Filter");
const Controller = require("./passwordPolicy_controller");
const Validate = require("./passwordPolicy_validation");
const getDBConnection = require('../../db/dbDynamicConnection');
const { passwordPolicySchema } = require("./passwordPolicy_model");
const auth = require("../../middlewares/auth");
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');

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

const router = express.Router();

router.post(
  "/add",
  auth(30, 2),
  validate(Validate.addPasswordPolicy),
  createModel,
  (req, res, next) => {
    if (req.body.schema && req.body.schema.PasswordPolicy) {
      return auditMiddleware.auditMiddleware(
        req.body.schema.PasswordPolicy,auditsFilter.createPasswordPolicy  // Pass `req`
      )(req, res, next);
    } else {
      return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'PasswordPolicy model not available'));
    }
  },  
  Controller.addPasswordPolicy
); //POST API FOR ADD PASSWORD POLICY
router.put(
  "/update/:Id",
  auth(33, 3),
  validate(Validate.updatePasswordPolicy),
  createModel,
  (req, res, next) => {
    if (req.body.schema && req.body.schema.PasswordPolicy) {
      return auditMiddleware.auditMiddleware(
        req.body.schema.PasswordPolicy, 
        (req) => auditsFilter.updatePasswordPolicy(req)  // Pass `req`
      )(req, res, next);
    } else {
      return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'PasswordPolicy model not available'));
    }
  },
  Controller.updatePasswordPolicy
); // PUT API FOR UPDATE THE PASSWORD POLICY
router.post(
  "/get",
  createModel,
  // auth(30, 1),
  // validate(Validate.getPasswordPolicy),
  Controller.getPasswordPolicy
); //GET USED FOR LIST  THE PASSWORD POLICY

module.exports = router;
