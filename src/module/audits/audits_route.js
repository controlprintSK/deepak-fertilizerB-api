// const validate = require('../../middlewares/validate');
const express = require('express');
// const auditsTrailValidation = require('./audits_validation');
const auditsTrailController = require('./audits_controller');
// const auth = require('../../middlewares/auth');
const getDBConnection = require('../../db/dbDynamicConnection');
const { auditsTrailSchema } = require('./audits_model');
const { audits } = require('../audits/audits_model');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
const router = express.Router();

const createModel = async (req, res, next) => {
  if (!req.body.db) {
    next(new ApiError(httpStatus.BAD_REQUEST, 'Unautherize11d user'));
  }

  let dbName = req.body.db;
  let conn = await getDBConnection(dbName);
  const auditsTrail = conn.model('auditsTrail', auditsTrailSchema, 'coll_auditsTrail');
  req.body.schema = { auditsTrail };
  next();
};

const ListModel = async (req, res, next) => {
  let dbName = req.headers['company'];
  if (dbName == undefined || dbName == '') {
    req.body.schema = { audits };
  } else {
    let conn = await getDBConnection(dbName);
    let audits = conn.model('auditsTrail', auditsTrailSchema, 'coll_auditsTrail');
    req.body.schema = { audits };
  }
  next();
};

router.post('/addAuditsTrail', createModel, auditsTrailController.addAuditsTrail);
router.post('/addAuditsTrailMainDB', auditsTrailController.addAuditsTrailMainDB);
router.post('/listAllTrails', ListModel, auditsTrailController.listAllTrails);

module.exports = router;
