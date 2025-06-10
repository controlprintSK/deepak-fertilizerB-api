const moduleJson = require('./modules.json');
const pageJson = require('./pages.json');
const rightMasterJson = require('./rightMaster.json');
const roleMasterJson = require('./roleMaster.json');
const pageRightJson = require('./pageRight.json');
// const roleRightMasterJson = require('./rolerightmaster.json');
const {
  addModuleMaster,
  addPageMaster,
  addRightMaster,
  addRoleMaster,
  addPageRight,
  // addRoleRightMaster,
} = require('../module/userMaster/master_service');

const initDefalutData = () => {
  addModuleMaster(moduleJson);
  addPageMaster(pageJson);
  addRightMaster(rightMasterJson);
  addRoleMaster(roleMasterJson);
  addPageRight(pageRightJson);
  // addRoleRightMaster(roleRightMasterJson);
};

module.exports = initDefalutData;
