const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');
const auth = require('../../middlewares/auth');
const auditMiddleware = require('../../middlewares/auditsTrail');
const { User } = require('../user/user.model');
const auditsFilter = require('../../utils/audits_Trail_Filter');
const getDBConnection = require('../../db/dbDynamicConnection');
const { passwordPolicySchema } = require('../passwordPolicy/passwordPolicy_model');
// const ApiError = require('../../utils/ApiError');
// const httpStatus = require('http-status');
const router = express.Router();
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

router.post('/register', validate(authValidation.register), authController.register);
router.post(
  '/login',
  auditMiddleware.auditMiddleware(User, auditsFilter.loginAuthFilter),
  validate(authValidation.login),
  authController.login
);
router.post(
  '/company-login',
  auditMiddleware.auditMiddleware(User, auditsFilter.companyLoginAuthFilter),
  validate(authValidation.companyLogin),
  authController.companyLogin
);
router.post(
  '/login-as-company',
  auth(10, 1),
  auditMiddleware.auditMiddleware(User, auditsFilter.loginAsCompanyAuthFilter),
  validate(authValidation.loginAsCompany),
  authController.loginAsCompany
);
router.post(
  '/logout',
  auditMiddleware.auditMiddleware(User, auditsFilter.logoutAuthFilter),
  validate(authValidation.logout),
  authController.logout
);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post(
  '/forgot-password',
  auditMiddleware.auditMiddleware(User, auditsFilter.forgotPasswordAuthFilter),
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  auditMiddleware.auditMiddleware(User, auditsFilter.resetPasswordAuthFilter),
  validate(authValidation.resetPassword),
  authController.resetPassword
);
router.post('/send-verification-email', authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post(
  '/change-password',
  auditMiddleware.auditMiddleware(User, auditsFilter.changePasswordAuthFilter),
  validate(authValidation.changePassword),
  createModel,
  authController.changePassword
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register as user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FirstName
 *               - LastName
 *               - UserName
 *               - Email
 *               - Mobile
 *               - UserRole
 *               - Password
 *             properties:
 *               FirstName:
 *                 type: string
 *               LastName:
 *                 type: string
 *               UserName:
 *                 type: string
 *               EmployeeCode:
 *                 type: string
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Must be unique
 *               Mobile:
 *                 type: string
 *                 description: Must be unique
 *               Department:
 *                 type: string
 *               UserRole:
 *                 type: number
 *                 description: Role of the user (e.g., 101 for SUPERADMIN)
 *               CompanyCode:
 *                 type: array
 *                 items:
 *                   type: string
 *               Password:
 *                 type: string
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               FirstName: Anuj
 *               LastName: Anuj
 *               UserName: anujpal123
 *               EmployeeCode: "22"
 *               Email: anuj123@gmail.com
 *               Mobile: "8965475232"
 *               Department: Software Engineer
 *               UserRole: 101
 *               CompanyCode: ["AK"]
 *               Password: Anujpal@123
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - UserName
 *               - Password
 *             properties:
 *               UserName:
 *                 type: string
 *               Password:
 *                 type: string
 *                 format: Password
 *             example:
 *               UserName: harsh
 *               Password: Password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: string
 *                 description: Enter the UserId(_id)
 *             example:
 *               user: 6582e29623e71a82ab5c79c4
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: An email will be sent to reset password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Email
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *             example:
 *               Email: fake@example.com
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset password token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - token
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               token:
 *                 type: string
 *             example:
 *               password: password1
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjkwZTgzMTBkMTdhYTExNjlhNzIwNWEiLCJVc2VyUm9sZSI6MTAxLCJpYXQiOjE3MjExMDg0MTIsImV4cCI6MTcyMTEyMjgxMiwidHlwZSI6ImFjY2VzcyIsInBhZ2VSaWdodHMiOlt7IlBhZ2VJZCI6MTAsIlBhZ2VVcmwiOiIvZGFzaGJvYXJkIiwiUmlnaHRzIjpbNSwxXX0seyJQYWdlSWQiOjIwLCJQYWdlVXJsIjoiL21hc3Rlci9jb21wYW55LW1hc3RlciIsIlJpZ2h0cyI6WzIsMSwzLDRdfSx7IlBhZ2VJZCI6MjEsIlBhZ2VVcmwiOiIvbWFzdGVyL2xpbmUtbWFzdGVyIiwiUmlnaHRzIjpbMSwyLDMsNCw1XX0seyJQYWdlSWQiOjIyLCJQYWdlVXJsIjoiL21hc3Rlci9wcm9kdWN0LW1hc3RlciIsIlJpZ2h0cyI6WzEsMiwzLDRdfSx7IlBhZ2VJZCI6MzAsIlBhZ2VVcmwiOiIvdXNlci1tYW5hZ2VtZW50L3VzZXIiLCJSaWdodHMiOlsxLDIsMyw0XX0seyJQYWdlSWQiOjMxLCJQYWdlVXJsIjoiL3VzZXItbWFuYWdlbWVudC91c2VyLXJpZ2h0IiwiUmlnaHRzIjpbMyw0LDEsMl19LHsiUGFnZUlkIjozMiwiUGFnZVVybCI6Ii91c2VyLW1hbmFnZW1lbnQvdHJhbnNmZXItcmlnaHQiLCJSaWdodHMiOlsxLDIsMyw0XX0seyJQYWdlSWQiOjQwLCJQYWdlVXJsIjoiL3RyYW5zYWN0aW9ucy9wcm9kdWN0aW9ucyIsIlJpZ2h0cyI6WzEsMiwzLDRdfSx7IlBhZ2VJZCI6NTAsIlBhZ2VVcmwiOiIvcmVwb3J0IiwiUmlnaHRzIjpbMSw1XX0seyJQYWdlSWQiOjYwLCJQYWdlVXJsIjoiL3N1cHBvcnQvdmlkZW8tbWFudWFsIiwiUmlnaHRzIjpbMV19LHsiUGFnZUlkIjo2MSwiUGFnZVVybCI6Ii9zdXBwb3J0L2NyZWF0ZS10aWNrZXQiLCJSaWdodHMiOlsxLDIsMyw0XX1dfQ.BrZaFzHln_MJLegYGWhbSDMiyrrfPyIowQ1jNjcbNM4
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: Password reset failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: 401
 *               message: Password reset failed
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send verification email
 *     description: An email will be sent to verify email.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: verify email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verify email token
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         description: verify email failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: 401
 *               message: verify email failed
 */
