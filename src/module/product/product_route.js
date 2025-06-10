const express = require('express');
const multer = require('multer');
const validate = require('../../middlewares/validate');
const productValidation = require('./product_validation');
const productController = require('./product_controller');
// const auth = require('../../middlewares/auth');
const getDBConnection = require('../../db/dbDynamicConnection');
const { productSchema } = require('./product_model');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const auditMiddleware = require('../../middlewares/auditsTrail');
const auditsFilter = require('../../utils/audits_Trail_Filter');
const fs = require('fs');
const router = express.Router();

const createModel = async (req, res, next) => {
  if (!req.headers['company']) {
    next(new ApiError(httpStatus.BAD_REQUEST, 'Unautherized user'));
  }
  let dbName = req.headers['company'];
  let conn = await getDBConnection(dbName);
  const Products = conn.model('product', productSchema, 'coll_product');
  req.body.schema = { Products };
  next();
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = './public/products';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    file.StartDate = req.body.StartDate;
    file.EndDate = req.body.EndDate;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 10)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}.png`);
  },
});

const upload = multer({ storage });
const cpUpload = upload.fields([{ name: 'Images', maxCount: 10 }]);

router.route('/').post(
  cpUpload,
  createModel,
  (req, res, next) => {
    if (req.body.schema && req.body.schema.Products) {
      return auditMiddleware.auditMiddleware(req.body.schema.Products, auditsFilter.addProductFilter)(req, res, next);
    } else {
      return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Products model not available'));
    }
  },
  validate(productValidation.addProduct),
  productController.addProduct
);

router.post('/listProducts', validate(productValidation.listProducts), createModel, productController.listProducts);

router.post(
  '/productListWithNameAndCode',
  validate(productValidation.productListWithNameAndCode),
  createModel,
  productController.productListWithNameAndCode
);

router
  .route('/:productCode')
  .get(validate(productValidation.getProduct), createModel, productController.getProduct)
  .put(
    cpUpload,
    createModel,
    (req, res, next) => {
      if (req.body.schema && req.body.schema.Products) {
        return auditMiddleware.auditMiddleware(req.body.schema.Products, auditsFilter.updateProductFilter)(req, res, next);
      } else {
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Products model not available'));
      }
    },
    validate(productValidation.updateProduct),
    productController.updateProduct
  )
  .delete(
    createModel,
    (req, res, next) => {
      if (req.body.schema && req.body.schema.Products) {
        return auditMiddleware.auditMiddleware(req.body.schema.Products, auditsFilter.deleteProductFilter)(req, res, next);
      } else {
        return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Products model not available'));
      }
    },
    validate(productValidation.deleteProduct),
    productController.deleteProduct
  );

router.post(
  '/syncDataToLineManager',
  validate(productValidation.syncDataToLineManager),
  createModel,
  productController.syncDataToLineManager
);

router.post('/syncDataToLineManagerStatusUpdate', createModel, productController.syncDataToLineManagerStatusUpdate);
router.put('/changeActiveProduct/:id', createModel, productController.changeActiveProduct);

router.post('/getAllProducts', validate(productValidation.listProducts), createModel, productController.getAllProducts);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Products
 */

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a product
 *     description: Only admins can create product.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ProductCode
 *               - ProductName
 *               - GenericName
 *               - BrandName
 *             properties:
 *               ProductCode:
 *                 type: string
 *               ProductName:
 *                 type: string
 *               GenericName:
 *                 type: string
 *               BrandName:
 *                 type: string
 *               Description:
 *                 type: string
 *               GTIN:
 *                 type: string
 *               UOM:
 *                 type: string
 *               Image:
 *                 type: string
 *               PackSize:
 *                 type: string
 *               Active:
 *                 type: Boolean,
 *             example:
 *               ProductName: ProductName value
 *               GenericName: GenericName value
 *               BrandName: BrandName value
 *               Description: Description value
 *               GTIN: GTIN value
 *               UOM: UOM value
 *               Image: Image value
 *               PackSize: PackSize value
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
 *         "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
