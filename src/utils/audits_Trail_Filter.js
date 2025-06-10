//Auth module
const loginAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'Login',
      },
    ],
  };
};
const createPasswordPolicy = () => {
  return {
    Activity: [
      {
        module: "PasswordPolicy",
        action: "add",
      },
    ],
  };
};
const updatePasswordPolicy = (_req) => {
  return {
    _id: _req.params.Id,
    Activity: [
      {
        module: "PasswordPolicy",
        action: "update",
      },
    ],
  };
};
const companyLoginAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'company login',
      },
    ],
  };
};
const loginAsCompanyAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'login as company',
      },
    ],
  };
};
const logoutAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'Logout',
      },
    ],
  };
};
const forgotPasswordAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'Forgot Password',
      },
    ],
  };
};
const resetPasswordAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'Reset Password',
      },
    ],
  };
};
const changePasswordAuthFilter = () => {
  return {
    Activity: [
      {
        module: 'Auth',
        action: 'Change Password',
      },
    ],
  };
};

//User module
const createUserFilter = () => {
  return {
    Activity: [
      {
        module: 'User',
        action: 'add',
      },
    ],
  };
};
const updateUserFilter = (req) => {
  return {
    _id: req.params.userId,
    Activity: [
      {
        module: 'User',
        action: 'update',
      },
    ],
  };
};
const deleteUserFilter = (req) => {
  return {
    _id: req.params.userId,
    Activity: [
      {
        module: 'User',
        action: 'delete',
      },
    ],
  };
};
//Company Module
const addCompanyFilter = () => {
  return {
    Activity: [
      {
        module: 'Company',
        action: 'add',
      },
    ],
  };
};
const updateCompanyFilter = (req) => {
  return {
    CompanyCode: req.body.CompanyCode,
    Activity: [
      {
        module: 'Company',
        action: 'update',
      },
    ],
  };
};
const deleteCompanyFilter = (req) => {
  return {
    CompanyCode: req.params.CompanyCode,
    Activity: [
      {
        module: 'Company',
        action: 'delete',
      },
    ],
  };
};
const createContactFilter = () => {
  return {
    Activity: [
      {
        module: 'Company Contact',
        action: 'add',
      },
    ],
  };
};
const updateContactByIdFilter = (req) => {
  return {
    _id: req.params._id,
    Activity: [
      {
        module: 'Company contact',
        action: 'update',
      },
    ],
  };
};
const deleteContactByIdFilter = (req) => {
  return {
    _id: req.params._id,
    Activity: [
      {
        module: 'Company Contact',
        action: 'delete',
      },
    ],
  };
};
// Product Module
const addProductFilter = () => {
  return {
    Activity: [
      {
        module: 'Product',
        action: 'add',
      },
    ],
  };
};
const updateProductFilter = (req) => {
  return {
    ProductCode: req.params.productCode,
    Activity: [
      {
        module: 'Product',
        action: 'update',
      },
    ],
  };
};
const deleteProductFilter = (req) => {
  return {
    ProductCode: req.params.productCode,
    Activity: [
      {
        module: 'Product',
        action: 'delete',
      },
    ],
  };
};
//Company Group Module
const createCompanyGroupFilter = () => {
  return {
    Activity: [
      {
        module: 'Company Group',
        action: 'add',
      },
    ],
  };
};
const updateCompanyGroupFilter = (req) => {
  return {
    Code: req.body.Code,
    Activity: [
      {
        module: 'Company Group',
        action: 'update',
      },
    ],
  };
};
const deleteCompanyGroupFilter = (req) => {
  return {
    Code: req.params.Code,
    Activity: [
      {
        module: 'Company Group',
        action: 'delete',
      },
    ],
  };
};
const changeActiveCompanyGroupFilter = (req) => {
  return {
    Code: req.params.Code,
    Activity: [
      {
        module: 'Company Group',
        action: 'update',
      },
    ],
  };
};
//Line manager Module
const createLineManagerFilter = () => {
  return {
    Activity: [
      {
        module: 'Line Manager',
        action: 'add',
      },
    ],
  };
};
const updateLineManagerFilter = (req) => {
  return {
    _id: req.params.id,
    Activity: [
      {
        module: 'Line Manager',
        action: 'update',
      },
    ],
  };
};
const deleteLineManagerFilter = (req) => {
  return {
    _id: req.params.id,
    Activity: [
      {
        module: 'Line Manager',
        action: 'delete',
      },
    ],
  };
};
//Production Module
const addProductionFilter = () => {
  return {
    Activity: [
      {
        module: 'Production',
        action: 'add',
      },
    ],
  };
};
const getProductionFilter = () => {
  return {
    Activity: [
      {
        module: 'Production',
        action: 'get',
      },
    ],
  };
};
const reviewProductionFilter = () => {
  return {
    Activity: [
      {
        module: 'Production',
        action: 'review',
      },
    ],
  };
};
const addLocalProductionFilter = () => {
  return {
    Activity: [
      {
        module: 'Production',
        action: 'add local',
      },
    ],
  };
};
// User Master
const addUserRightsFilter = (req) => {
  return {
    CompanyCode: req.body.CompanyCode,
    Activity: [
      {
        module: 'User Master',
        action: 'add',
      },
    ],
  };
};

const updateGeneralSettings = (_req) => {
  return {
    _id: _req.params.Id,
    Activity: [
      {
        module: "GeneralSettings",
        action: "update",
      },
    ],
  };
};
const createGeneralSettings = () => {
  return {
    Activity: [
      {
        module: "GeneralSettings",
        action: "add",
      },
    ],
  };
};


module.exports = {
  //Auth module
  loginAuthFilter,
  companyLoginAuthFilter,
  loginAsCompanyAuthFilter,
  logoutAuthFilter,
  forgotPasswordAuthFilter,
  resetPasswordAuthFilter,
  changePasswordAuthFilter,
  //User module
  createUserFilter,
  updateUserFilter,
  deleteUserFilter,
  //Company Module
  addCompanyFilter,
  updateCompanyFilter,
  deleteCompanyFilter,
  updateContactByIdFilter,
  deleteContactByIdFilter,
  createContactFilter,
  // Product Module
  addProductFilter,
  updateProductFilter,
  deleteProductFilter,
  //Company Group Module
  createCompanyGroupFilter,
  updateCompanyGroupFilter,
  deleteCompanyGroupFilter,
  changeActiveCompanyGroupFilter,
  //Line Manager Module
  createLineManagerFilter,
  updateLineManagerFilter,
  deleteLineManagerFilter,
  //Production Module
  addProductionFilter,
  getProductionFilter,
  addLocalProductionFilter,
  reviewProductionFilter,
  //User master module
  addUserRightsFilter,

  updatePasswordPolicy,
  createPasswordPolicy,
  updateGeneralSettings,
  createGeneralSettings
  
};
