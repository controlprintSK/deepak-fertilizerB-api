const express = require('express');
const validate = require('../../middlewares/validate');
const companyValidation = require('./company_validation');
const companyController = require('./company_controller');
const auth = require('../../middlewares/auth');
const auditMiddleware = require('../../middlewares/auditsTrail');
const { Company, CompanyContact } = require('./company_model');
const auditsFilter = require('../../utils/audits_Trail_Filter');
const router = express.Router();

router.post(
  '/addCompany',
  // auth(20, 2),
  validate(companyValidation.createCompany),
  auditMiddleware.auditMiddleware(Company, auditsFilter.addCompanyFilter),
  companyController.createCompany
); // Add Company Details & Contact Details.
router.post(
  '/addContact',
  auth(20, 2),
  auditMiddleware.auditMiddleware(CompanyContact, auditsFilter.createContactFilter),
  validate(companyValidation.createContact),
  companyController.createContact
); // Add Company Details & Contact Details.
router.put(
  "/updateCompany",
  // auth(20, 3),
  auditMiddleware.auditMiddleware(Company, auditsFilter.updateCompanyFilter),
  validate(companyValidation.updateCompany),
  companyController.updateCompany
); // Update Only Company Details.
router.post('/listCompany',
  // auth(20, 2),
  validate(companyValidation.listCompany), companyController.listCompany); // List Only Company Details
router.get(
  '/listCompanyContact/:CompanyCode',
  auth(20, 1),
  validate(companyValidation.listCompany),
  companyController.listCompanyContact
); // List Company Contact Details.
router.post('/listByCode/:CompanyCode', auth(20, 1), validate(companyValidation.listByCode), companyController.listByCode); // List all Details of Company & Contact Details
router
  .route('/:CompanyCode')
  .get(validate(companyValidation.listCompanyByCode), companyController.listCompanyByCode) // list Company By CompanyCode
  .delete(
    auth(20, 4),
    auditMiddleware.auditMiddleware(Company, auditsFilter.deleteCompanyFilter),
    validate(companyValidation.deleteCompany),
    companyController.deleteCompany
  ); // Delete Company & Contact Details.
router
  .route('/contact/:_id')
  .put(
    auth(20, 3),
    auditMiddleware.auditMiddleware(CompanyContact, auditsFilter.updateContactByIdFilter),
    validate(companyValidation.updateContactById),
    companyController.updateContactById
  ) // Update COntact Information
  .delete(
    auth(20, 4),
    auditMiddleware.auditMiddleware(CompanyContact, auditsFilter.deleteContactByIdFilter),
    validate(companyValidation.deleteContactById),
    companyController.deleteContactById
  ); // Delete COntact Information
router.post('/listAllCompany', companyController.listAllCompany);
router.put('/changeActiveCompany/:id', companyController.changeActiveCompany);
router.post(
  "/listCompanyContact/:CompanyCode",
  auth(10, 1),
  validate(companyValidation.listCompanyContact),
  companyController.listCompanyContact
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company management
 */

/**
 * @swagger
 * /Company/addCompany:
 *   post:
 *     summary: Create a Company
 *     description: Only admins can create a company.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CompanyCode
 *               - CompanyName
 *               - CompanyGroup
 *               - Address
 *               - City
 *               - State
 *               - Country
 *               - PinCode
 *               - IpAddress
 *               - Active
 *               - LicenseNo
 *               - CompanyType
 *               - ContactDetails
 *             properties:
 *               CompanyCode:
 *                 type: string
 *               CompanyName:
 *                 type: string
 *               CompanyGroup:
 *                 type: string
 *               Address:
 *                 type: string
 *               City:
 *                 type: string
 *               State:
 *                 type: string
 *               Country:
 *                 type: string
 *               PinCode:
 *                 type: string
 *                 pattern: "^[0-9]{6}$"
 *               IpAddress:
 *                 type: string
 *                 format: ipv4
 *               Active:
 *                 type: boolean
 *               LicenseNo:
 *                 type: string
 *               CompanyType:
 *                 type: string
 *               ContactDetails:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CompanyContact' # Assuming you have a schema for CompanyContact
 *                 minItems: 1
 *             example:
 *               CompanyCode: "3333"
 *               CompanyName: "Mankind Limited"
 *               CompanyGroup: "Mankind Limited"
 *               Address: "A-36 ground Floor Sector 4 Noida"
 *               City: "Paonta"
 *               State: "Himachal"
 *               Country: "India"
 *               PinCode: "342131"
 *               IpAddress: "102.12.12.12"
 *               Active: true
 *               LicenseNo: "2542345224"
 *               CompanyType: "4566"
 *               ContactDetails:
 *                 - CompanyCode: "John Doe"
 *                   Name: "John Doe"
 *                   ContactNo: "1234567890"
 *                   Email: "john.doe@example.com"
 *                   Designation: "John Doe"
 *                   Purpose: "John Doe"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 */

/**
 * @swagger
 * /Company/updateCompany:
 *   put:
 *     summary: Update a Company
 *     description: Only admins can update a company.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CompanyCode
 *               - CompanyName
 *               - CompanyGroup
 *               - Address
 *               - City
 *               - State
 *               - Country
 *               - PinCode
 *               - IpAddress
 *               - Active
 *               - LicenseNo
 *               - CompanyType
 *             properties:
 *               CompanyCode:
 *                 type: string
 *               CompanyName:
 *                 type: string
 *               CompanyGroup:
 *                 type: string
 *               Address:
 *                 type: string
 *               City:
 *                 type: string
 *               State:
 *                 type: string
 *               Country:
 *                 type: string
 *               PinCode:
 *                 type: string
 *                 pattern: "^[0-9]{6}$"
 *               IpAddress:
 *                 type: string
 *                 format: ipv4
 *               Active:
 *                 type: boolean
 *               LicenseNo:
 *                 type: string
 *               CompanyType:
 *                 type: string
 *             example:
 *               CompanyCode: "AF"
 *               CompanyName: "hmfghm"
 *               CompanyGroup: "Mankind Pharma 1"
 *               Address: "Noida UP"
 *               City: "GHAZIABAD"
 *               State: "UTTAR PRADESH"
 *               Country: "India"
 *               PinCode: "201010"
 *               IpAddress: "25.10.25.35"
 *               Active: true
 *               LicenseNo: "1245554"
 *               CompanyType: "Company type 1"
 *     responses:
 *       "200":
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 */

/**
 * @swagger
 * /Company/listCompany:
 *   post:
 *     summary: List Companies
 *     description: List companies with pagination and sorting.
 *     tags: [Company]
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
 *                   example: "Companies Details"
 *                 data:
 *                   type: object
 *                   properties:
 *                     docs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Company'
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
 * /Company/{CompanyCode}:
 *   get:
 *     summary: Get a company by CompanyCode
 *     description: Only admins can retrieve a company by its CompanyCode.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CompanyCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Company code
 *     responses:
 *       "200":
 *         description: A company object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
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
 * /Company/{CompanyCode}:
 *   delete:
 *     summary: Delete a company & Contact Details by CompanyCode
 *     description: Only admins can delete a company by its CompanyCode.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CompanyCode
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
 * /company/listByCode/{CompanyCode}:
 *   post:
 *     summary: Get a company & Contact Details by CompanyCode
 *     description: Only admins can delete a company by its CompanyCode.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CompanyCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Company code
 *     responses:
 *       "200":
 *         description: Company Details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fetch Company Details successfully"
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
 * /Company/addContact:
 *   post:
 *     summary: Create a Contact
 *     description: Only admins can create a Contact.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CompanyCode
 *               - Name
 *               - ContactNo
 *               - Email
 *               - Designation
 *               - Purpose
 *             properties:
 *               CompanyCode:
 *                 type: string
 *               Name:
 *                 type: string
 *               ContactNo:
 *                 type: string
 *               Email:
 *                 type: string
 *               Designation:
 *                 type: string
 *               Purpose:
 *                 type: string
 *             example:
 *               CompanyCode: "3333"
 *               Name: "Harsh"
 *               ContactNo: 9876789878
 *               Email: "test@gmail.com"
 *               Designation: "Manager"
 *               Purpose: "Just for Communication"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
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
 * /company/listCompanyContact/{CompanyCode}:
 *   get:
 *     summary: Get Contact Details by CompanyCode
 *     description: Only admins can retrieve a Contact by its CompanyCode.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: CompanyCode
 *         required: true
 *         schema:
 *           type: string
 *         descny codeription: Compa
 *     responses:
 *       "200":
 *         description: A company object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       "404":
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact not found"
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
 * /contact/{id}:
 *   put:
 *     summary: Update Contact Details by _id
 *     description: Only admins can retrieve a Contact by its CompanyCode.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The CompanyCode of the contact to retrieve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CompanyCode
 *               - Name
 *               - ContactNo
 *               - Email
 *               - Designation
 *               - Purpose
 *             properties:
 *               CompanyCode:
 *                 type: string
 *               Name:
 *                 type: string
 *               ContactNo:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               Email:
 *                 type: string
 *                 format: email
 *               Designation:
 *                 type: string
 *               Purpose:
 *                 type: string
 *             example:
 *               CompanyCode: "3333"
 *               Name: "Harsh"
 *               ContactNo: "9876789878"
 *               Email: "test@gmail.com"
 *               Designation: "Manager"
 *               Purpose: "Just for Communication"
 *     responses:
 *       '200':
 *         description: Contact details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       '404':
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact not found"
 *       '400':
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
 * /contact/{id}:
 *   delete:
 *     summary: Delete Contact Details by Id
 *     description: Only admins can delete a Contact by its Id.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id
 *     responses:
 *       "200":
 *         description: Contact deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact deleted successfully"
 *       "404":
 *         description: Contact not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact not found"
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
