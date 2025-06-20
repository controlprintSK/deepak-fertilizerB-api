const express = require('express');
const authRoute = require('../../module/auth/auth.route');
const userMasterRoute = require('../../module/userMaster/master_route');
const companyRoute = require('../../module/company/company_route');
const lineRoute = require('../../module/lineManager/linemanager_route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/userMaster',
    route: userMasterRoute,
  },
  {
    path: '/company',
    route: companyRoute,
  },
  {
    path: '/line',
    route: lineRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
