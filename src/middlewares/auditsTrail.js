// const config = require('../config/config');
const fileLogger = require('./logger');
const moment = require('moment');
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const jwt = require('jsonwebtoken');
const { addAuditsTrailMainDB, addAuditsTrail } = require('../module/audits/audits_service');

// const URL = config.localURL || config.testingURL || config.productionURL;

const createAuditsTrail = async (logData) => {
  // fetch(`${URL}/v1/auditsTrail/addAuditsTrail`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(logData),
  // });
  addAuditsTrail(logData);
};

// For Super admin because they dont have company code
const createAuditsTrailMainDB = async (logData) => {
  // fetch(`${URL}/v1/auditsTrail/addAuditsTrailMainDB`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(logData),
  // });

  addAuditsTrailMainDB(logData);
};

const auditsTailData = async (logData) => {
  if (!logData.db) {
    createAuditsTrailMainDB(logData); // For Super admin or those who dont have company code
  } else {
    createAuditsTrail(logData); // For those who have company code
  }
};

// const auditMiddleware = (Model, filterKey) => {
//   try {
//     return async (req, res, next) => {
//       const filter = filterKey(req);
//       let { Activity, ...restData } = filter;
//       const originalSend = res.send;
//       let _beforeData = '';
//       const RequestTime = moment().format('DD-MM-YYYY HH:mm:ss.SSSS');
//       fileLogger.info(`API: "${req.url}" request-Data: ${JSON.stringify(req.body)}`);
//       if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
//         try {
//           if (Object.keys(restData).length > 0) {
//             let beforeData = await Model.findOne({
//               ...restData,
//             });
//             if (beforeData) {
//               try {
//                 _beforeData = beforeData.toObject(); // Convert Mongoose document to plain object if needed
//                 if (_beforeData) {
//                   delete _beforeData['lastPasswords'];
//                   delete _beforeData['wrongPassword'];
//                   delete _beforeData['passwordExpiry'];
//                   delete _beforeData['Status'];
//                   delete _beforeData['createdAt'];
//                   delete _beforeData['updatedAt'];
//                   delete _beforeData['_id'];
//                   delete _beforeData['__v'];
//                 }
//               } catch (error) {
//                 // console.error('Error parsing beforeData:', error);
//               }
//             } else {
//               // console.log('No document found');
//             }
//           } else {
//             _beforeData = '';
//             // console.log('restData is empty, no query made');
//           }
//         } catch (error) {
//           next();
//           console.error(error, 'Error fetching beforeData');
//         }
//       }
//       // Variable to hold the response data
//       let responseBody = '';
//       // Override res.send to capture the response body
//       res.send = (body) => {
//         responseBody = body;
//         // Call the original res.send function
//         console.log(responseBody, 'responseBodyresponseBody');
//         originalSend.call(res, body);
//       };
//       // Use 'finish' event to capture afterData and response body
//       res.on('finish', async () => {
//         if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
//           try {
//             let authorizationHeader = req.headers.authorization;
//             let token = null;
//             if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
//               token = authorizationHeader.substring(7);
//             }
//             const decoded = jwt.decode(token, { complete: true });

//             let responseBodyyy = JSON.parse(responseBody);
//             let afterData;
//             if (req.url === '/login') {
//               afterData = { data: 'Login success' };
//             } else if (req.url === '/logout') {
//               afterData = { data: 'Logout success' };
//             } else if (req.method === 'DELETE') {
//               afterData = { data: 'Data deleted' };
//             } else if (req.url === '/getProduction') {
//               afterData = responseBodyyy.data;
//             } else {
//               afterData = responseBodyyy.data;
//             }
//             let logData = {
//               userId: decoded.payload.sub,
//               UserRole: decoded.payload.UserRole,
//               Email: decoded.payload.Email,
//               UserName: decoded.payload.UserName,
//               CompanyCode: req.headers.company ? req.headers.company : '',
//               IpAddress: req.headers?.Host ? req.headers?.Host : '',
//               db: req.headers.company ? req.headers.company : '',
//               API: req.url,
//               RequestTime: RequestTime,
//               ResponseTime: moment().format('DD-MM-YYYY HH:mm:ss.SSSS'),
//               Activity: Activity,
//               History: [
//                 {
//                   Before: _beforeData,
//                   After: afterData,
//                 },
//               ],
//               RequestData: req.body,
//               ResponseData: responseBody,
//             };
//             auditsTailData(logData);
//           } catch (error) {
//             return next(error);
//           }
//         }
//       });

//       fileLogger.info(`API: "${req.url}" response-Data: ${JSON.stringify(responseBody)}`);

//       next();
//     };
//   } catch (error) {
//     fileLogger.error(`API: "${req.url}" catch-error: ${JSON.stringify(error)}`);
//     return next(error);
//   }
// };

const auditMiddleware = (Model, filterKey) => {
  return async (req, res, next) => {
    try {
      const filter = filterKey(req);      
      const { Activity, ...restData } = filter;
      const originalSend = res.send.bind(res);
      let _beforeData = '';
      const requestTime = moment().format('DD-MM-YYYY HH:mm:ss.SSSS');

      fileLogger.info(`API: "${req.url}" request-Data: ${JSON.stringify(req.body)}`);

      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        if (Object.keys(restData).length > 0) {
          try {
            
            const beforeData = await Model(global.sequelize).findOne(restData);
            if (beforeData) {
              _beforeData = beforeData;
              const fieldsToRemove = [
                'lastPasswords',
                'wrongPassword',
                'passwordExpiry',
                'Status',
                'createdAt',
                'updatedAt',
                '_id',
                '__v',
              ];
              fieldsToRemove.forEach((field) => delete _beforeData[field]);
            }
          } catch (error) {
            fileLogger.error(`Error fetching beforeData: ${error.message}`);
            return next(error);
          }
        }
      }

      let responseBody = '';
      res.send = (body) => {
        responseBody = body;
        originalSend(body);
      };

      res.on('finish', async () => {
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
          try {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
            const decoded = token ? jwt.decode(token, { complete: true }) : null;

            const parsedResponse = JSON.parse(responseBody);
            let afterData = {};

            if (req.url === '/login') {
              afterData = { data: 'Login success' };
            } else if (req.url === '/logout') {
              afterData = { data: 'Logout success' };
            } else if (req.method === 'DELETE') {
              afterData = { data: 'Data deleted' };
            } else if (req.url === '/getProduction') {
              afterData = parsedResponse?.data || {};
            } else {
              afterData = parsedResponse?.data || {};
            }

            const logData = {
              userId: decoded?.payload?.sub || '',
              UserRole: decoded?.payload?.UserRole || '',
              Email: decoded?.payload?.Email || '',
              UserName: decoded?.payload?.UserName || '',
              CompanyCode: req.headers.company || '',
              IpAddress: req.headers.host || '',
              db: req.headers.company || '',
              API: req.url,
              RequestTime: requestTime,
              ResponseTime: moment().format('DD-MM-YYYY HH:mm:ss.SSSS'),
              Activity,
              History: [
                {
                  Before: _beforeData,
                  After: afterData,
                },
              ],
              RequestData: req.body,
              ResponseData: responseBody,
            };

            auditsTailData(logData);
          } catch (error) {
            fileLogger.error(`Error processing audit log: ${error.message}`);
            return next(error);
          }
        }
      });

      next();
    } catch (error) {
      fileLogger.error(`API: "${req.url}" catch-error: ${JSON.stringify(error.message)}`);
      return next(error);
    }
  };
};


// const auditMiddlewareU = (Model, filterKey) => {
  // try {
    // return async (req, res, next) => {
      // const filter = filterKey(req);
      // const { Activity, ...restData } = filter;
      // const originalSend = res.send;
      // let responseBody = "";
      // let _beforeData = {};
      // const requestTime = moment().format("DD-MM-YYYY HH:mm:ss.SSSS");

      // if (Object.keys(restData).length > 0) {
        // const beforeData = await Model.findOne(restData);
        // if (beforeData) {
          // _beforeData = sanitizeData(beforeData.toObject());
        // }
      // }
      // res.send = (body) => {
        // responseBody = body;
        // originalSend.call(res, body);
      // };

      // function sanitizeData(data) {
        // const fieldsToRemove = [
          // "Password",
          // "LastPasswords",
          // "Status",
          // "createdAt",
          // "updatedAt",
          // "_id",
          // "__v",
          // "token",
        // ];

        // function removeKeys(target) {
          // if (Array.isArray(target)) {
            // target.forEach(removeKeys);
          // } else if (target && typeof target === "object") {
            // Object.keys(target).forEach((key) => {
              // if (fieldsToRemove.includes(key)) {
                // delete target[key];
              // } else {
                // removeKeys(target[key]);
              // }
            // });
          // }
        // }

        // const clonedObject = JSON.parse(JSON.stringify(data));
        // removeKeys(clonedObject);
        // return clonedObject;
      // }

      // const prepareLogData = (decoded, afterData, parsedResponse) => ({
        // userId: decoded?.payload?.sub,
        // UserRole: decoded?.payload?.UserRole,
        // UserName: decoded?.payload?.UserName,
        // CompanyCode: decoded?.payload?.CompanyCode || "",
        // IpAddress: req?.headers?.host || "",
        // API: req.url,
        // RequestTime: requestTime,
        // ResponseTime: moment().format("DD-MM-YYYY HH:mm:ss.SSSS"),
        // Activity,
        // History: [
          // {
            // Before: sanitizeData(_beforeData),
            // After: sanitizeData(afterData),
          // },
        // ],
        // RequestData: sanitizeData(req.body),
        // ResponseData: sanitizeData(parsedResponse),
      // });

      // const LoginLogData = (decoded, afterData, parsedResponse) => ({
        // userId: "",
        // UserRole: "",
        // UserName: req?.body?.UserName,
        // CompanyCode: req?.body?.CompanyCode || "",
        // IpAddress: req?.headers?.host || "",
        // API: req.url,
        // RequestTime: requestTime,
        // ResponseTime: moment().format("DD-MM-YYYY HH:mm:ss.SSSS"),
        // Activity,
        // History: [
          // {
            // Before: "",
            // After: sanitizeData(afterData),
          // },
        // ],
        // RequestData: sanitizeData(req.body),
        // ResponseData: sanitizeData(parsedResponse),
      // });

      // res.on("finish", async () => {
        // if (["POST", "PUT", "DELETE"].includes(req.method)) {
          // try {
            // let decoded = getDecodedToken(req.headers.authorization);

            // const parsedResponse = JSON.parse(responseBody);
            // let afterData = { message: parsedResponse?.message };

            // if (String(req.url).includes("/login")) {
              // if (String(parsedResponse?.status)?.includes("20")) {
                // afterData = { message: "Login success" };
                // decoded = getDecodedToken(parsedResponse?.data?.access?.token);
              // }
            // } else if (String(req.url).includes("/authorize")) {
              // if (String(parsedResponse?.status)?.includes("20")) {
                // afterData = { message: "Authorized success" };
              // }
            // } else if (String(req.url)?.includes("/logout")) {
              // afterData = { message: "Logout success" };
            // } else if (String(req.url)?.includes("/change-password")) {
              // afterData = { message: "Change Password success" };
            // } else if (req.method === "DELETE") {
              // afterData = { message: "Data deleted" };
            // } else if (String(req.url)?.includes("/getProduction")) {
              // afterData = parsedResponse.data || {};
            // } else {
              // afterData = parsedResponse.data || {};
              // if (!String(parsedResponse?.status)?.includes("20")) {
                // afterData = {
                  // message: parsedResponse?.message || "Invalid Credentials",
                // };
              // }
            // }

            // let LoginFailedData = LoginLogData(
              // decoded,
              // afterData,
              // parsedResponse
            // );

            // const logData = prepareLogData(decoded, afterData, parsedResponse);

            // if (
              // String(parsedResponse?.status)?.includes("40") &&
              // String(req.url)?.includes("/login")
            // ) {
              // auditsTailData(LoginFailedData);
              // if (configJson["DEBUG_MODE"]) {
                // fileLogger.info(
                  // `API: "${req.url}" | request: ${JSON.stringify(
                    // sanitizeData(req.body)
                  // )} | response: ${JSON.stringify(
                    // sanitizeData(parsedResponse)
                  // )}`
                // );
              // }
            // } else if (String(parsedResponse?.status)?.includes("40")) {
              // auditsTailData(logData);
              // if (configJson["DEBUG_MODE"]) {
                // fileLogger.info(
                  // `API: "${req.url}" | request: ${JSON.stringify(
                    // sanitizeData(req.body)
                  // )} | response: ${JSON.stringify(
                    // sanitizeData(parsedResponse)
                  // )}`
                // );
              // }
            // } else {
              // auditsTailData(logData);
              // if (configJson["DEBUG_MODE"]) {
                // fileLogger.info(
                  // `API: "${req.url}" | request: ${JSON.stringify(
                    // sanitizeData(req.body)
                  // )} | response: ${JSON.stringify(
                    // sanitizeData(parsedResponse)
                  // )}`
                // );
              // }
            // }
          // } catch (error) {
            // if (configJson["DEBUG_MODE"]) {
              // fileLogger.error(
                // `API: "${req.url}" | error: ${JSON.stringify(error)}`
              // );
            // }
            // next();
          // }
        // }
      // });

      // next();
    // };
  // } catch (error) {
    // if (configJson["DEBUG_MODE"]) {
      // fileLogger.error(
        // `API: "${req.url}" | catch-error: ${JSON.stringify(error)}`
      // );
    // }
    // next();
  // }
// };

module.exports = {
  createAuditsTrail,
  createAuditsTrailMainDB,
  auditsTailData,
  auditMiddleware,
  // auditMiddlewareU
};
