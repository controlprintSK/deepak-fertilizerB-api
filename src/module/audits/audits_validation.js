const Joi = require('joi');

const addAuditsTrail = Joi.object().keys({
    User: Joi.string().required(),
    CompanyCode: Joi.string().required(),
    UserId: Joi.string().required(),
    UserEmail: Joi.string().required(),
    UserRole: Joi.string(),
    Activity: Joi.string(),
    API: Joi.string(),
    RequestTime: Joi.string(),
    ResponseTime: Joi.string(),
    History: Joi.string().required(),
    SourceIpAddress: Joi.string().required(),
    NetworkIp: Joi.string().required(),
    RequestData: Joi.string().required(),
    ResponseData: Joi.string().required(),
});


module.exports = {
    addAuditsTrail,
};
