const express = require('express');
const validate = require('../../middlewares/validate');
const lineManagerValidation = require('./linemanager_validation');
const lineManagerController = require('./linemanager_controller');
// const auth = require('../../middlewares/auth');
const { LineMaster } = require('./linemanager_model');
const getDBConnection = require('../../db/dbDynamicConnection');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const auditMiddleware = require('../../middlewares/auditsTrail');
const auditsFilter = require('../../utils/audits_Trail_Filter');
const createDatabases = require('../../db/createDatabase');

const router = express.Router();

const createModel = async (req, res, next) => {
  if (!req.headers['company']) {
    next(new ApiError(httpStatus.BAD_REQUEST, 'Unautherized user'));
  }
  let dbName = req.headers['company'];
  await createDatabases(`DB_DEEPAK_${dbName}`);
  const sequelize = await getDBConnection(dbName);
  sequelize.sync({ alter: true });
  const getLineModel = LineMaster(sequelize);

  req.body.schema = { getLineModel };
  next();
};

router.post(
  '/addLine',
  // auth(21, 2),
  validate(lineManagerValidation.listLineMaster),
  createModel,
  (req, res, next) => {
    if (req.body.schema && req.body.schema.getLineModel) {
      return auditMiddleware.auditMiddleware(req.body.schema.getLineModel, auditsFilter.createLineManagerFilter)(
        req,
        res,
        next
      );
    } else {
      return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'LineManager model not available'));
    }
  },
  lineManagerController.createLineManager
);
router.put(
  '/updateLine/:id',
  // auth(21, 3),
  validate(lineManagerValidation.updateLineMaster),
  createModel,
  // (req, res, next) => {
  //   if (req.body.schema && req.body.schema.getLineModel) {
  //     return auditMiddleware.auditMiddleware(req.body.schema.getLineModel, auditsFilter.updateLineManagerFilter(req))(
  //       req,
  //       res,
  //       next
  //     );
  //   } else {
  //     return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'LineManager model not available'));
  //   }
  // },
  lineManagerController.updateLineManager
);
router.post('/listLine', validate(lineManagerValidation.listLineMaster), createModel, lineManagerController.listLineManager); //, auth(21, 1)
router.get('/listLineById/:id', createModel, lineManagerController.listLineById); //, auth(21, 1)
// router.get('/listLineManagerById/:id', createModel, lineManagerController.listLineManagerById); //, auth(21, 1)

router.route('/:id').delete(
  // auth(21, 4),
  validate(lineManagerValidation.deleteLineMaster),
  createModel,
  // (req, res, next) => {
  //   if (req.body.schema && req.body.schema.getLineModel) {
  //     return auditMiddleware.auditMiddleware(req.body.schema.getLineModel, auditsFilter.deleteLineManagerFilter(req))(
  //       req,
  //       res,
  //       next
  //     );
  //   } else {
  //     return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'LineManager model not available'));
  //   }
  // },
  lineManagerController.deleteLineManager
);

// router.put('/changeActiveLineManager/:id', auth(21, 1), createModel, lineManagerController.changeActiveLineManager);
// router.post(
//   '/syncDataToLineManager',
//   validate(lineManagerValidation.syncDataToLineManager),
//   createModel,
//   lineManagerController.syncDataToLineManager
// );

// router.post('/syncDataToLineManagerStatusUpdate', createModel, lineManagerController.syncDataToLineManagerStatusUpdate);

// router.post('/getAllLines', createModel, lineManagerController.getAllLines);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Line Manager
 *   description: Create Line Manager
 */

/**
 * @swagger
 * /addLineManager:
 *   post:
 *     summary: Create a Line Manager
 *     description: User can create Line Manager.
 *     tags: [Line Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Code
 *               - name
 *               - CompanyCode
 *             properties:
 *               code:
 *                 type: string
 *                 description: must be unique
 *               name:
 *                 type: string
 *               CompanyCode:
 *                 type: string
 *               IPAddress:
 *                 type: string
 *                 format: ipaddress
 *                 description: Valid IP Address
 *               Active:
 *                  type: Boolean
 *                  description: must be checked
 *             example:
 *               Code: D0001
 *               name: fake name
 *               CompanyCode: C8575
 *               IPAddress: 172.168.4.183
 *               Active: true
 *     responses:
 *       "201":
 *         description: Line Manager Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/LineManager'
 *             example:
 *                status: 201
 *                message: Crated *
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /updateLineManager/:id:
 *   put:
 *     summary: Update a Line Manager
 *     description: Update Line Manager.
 *     tags: [Line Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Code
 *               - name
 *               - CompanyCode
 *             properties:
 *               code:
 *                 type: string
 *                 description: must be unique
 *               name:
 *                 type: string
 *               CompanyCode:
 *                 type: string
 *               IPAddress:
 *                 type: string
 *                 format: ipaddress
 *                 description: Valid IP Address
 *               Active:
 *                  type: Boolean
 *                  description: must be checked
 *             example:
 *               Code: D0001
 *               name: fake name
 *               CompanyCode: C8575
 *               IPAddress: 172.168.4.183
 *               Active: true
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LineManager'
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request body"
 *       "404":
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Line Master not found"
 */

/**
 * @swagger
 * /listLineManager/{CompanyCode}:
 *   post:
 *     summary: List Companies
 *     description: List Line Manager with pagination and sorting.
 *     tags: [Line Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *               limit:
 *                 type: integer
 *                 description: Maximum number of results per page
 *               page:
 *                 type: integer
 *                 description: Page number
 *             example:
 *               sortBy: "createdAt"
 *               limit: 5
 *               page: 1
 *     responses:
 *       "200":
 *         description: A list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Line Mna Details"
 *                 data:
 *                   type: object
 *                   properties:
 *                     docs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LineManager'
 *                     totalDocs:
 *                       type: integer
 *                       example: 100
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pagingCounter:
 *                       type: integer
 *                       example: 1
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     nextPage:
 *                       type: integer
 *                       example: 2
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request body"
 */

/**
 * @swagger
 * listLineManagerById/{id}:
 *   get:
 *     summary: Get a Line Manager by code
 *     description: Line Manager Data by Line ID.
 *     tags: [Line Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         id: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Line Manager id
 *     responses:
 *       "200":
 *         description: A Line object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LineManager'
 *       "404":
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Line not found"
 *       "400":
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request"
 */
/**
 * @swagger
 * changeActiveLineManager/{id}:
 *   put:
 *     summary: Active/In-Active Line Manager by id
 *     description: Only admins can delete a company by its code.
 *     tags: [Line Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Code
 *         required: true
 *         schema:
 *           type: string
 *         description: Company code
 *     responses:
 *       "200":
 *         description: Company deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company deleted successfully"
 *       "404":
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company not found"
 *       "400":
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request"
 */
/**
 * @swagger
 * /LineManager/{id}:
 *   delete:
 *     summary: Delete a company by code
 *     description: Those user has rights can delete the Line Master.
 *     tags: [Line Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         id: id
 *         required: true
 *         schema:
 *           type: string
 *         description: id
 *     responses:
 *       "200":
 *         description: Line Manager deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Line Manager deleted successfully"
 *       "404":
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Line Manager not found"
 *       "400":
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request"
 */
