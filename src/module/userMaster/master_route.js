const express = require('express');
const validate = require('../../middlewares/validate');
const masterValidation = require('./master_validation');
const masterController = require('./master_controller');
const auditMiddleware = require('../../middlewares/auditsTrail');
const auditsFilter = require('../../utils/audits_Trail_Filter');
const { UserRights } = require('./master_model');

const router = express.Router();

// validate(masterValidation.addRoleRightMaster)

router.post('/addModuleMaster', validate(masterValidation.addModuleMaster), masterController.addModuleMaster);
router.post('/addPageMaster', validate(masterValidation.addPageMaster), masterController.addPageMaster);
router.post('/addRightMaster', validate(masterValidation.addRightMaster), masterController.addRightMaster);
router.post('/addPageRight', validate(masterValidation.addPageRight), masterController.addPageRight);
router.post('/addRoleMaster', validate(masterValidation.addRoleMaster), masterController.addRoleMaster);
router.post('/addRoleRightMaster', masterController.addRoleRightMaster);
router.post(
  '/addUserRights',
  validate(masterValidation.addUserRights),
  auditMiddleware.auditMiddleware(UserRights, auditsFilter.addUserRightsFilter),
  masterController.addUserRights
);
router.post('/getRightsByRoleId', validate(masterValidation.getRightsByRoleId), masterController.getRightsByRoleId);

router.post('/getMenuByUserId', validate(masterValidation.getMenuByUserId), masterController.getMenuByUserId);
router.post('/getAllMenu', masterController.getAllMenu);
router.get('/getRoleMaster', masterController.getRoleMaster);


router.post("/getAllMenuForUserGroup", masterController.getAllMenuForUserGroup);
router.post(
  "/addRemoveUserGroupsRights",
  masterController.addRemoveUserGroupsRights
);

module.exports = router;
