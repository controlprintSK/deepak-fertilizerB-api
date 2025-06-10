const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../utils/plugins');

const lineManagerSchema = mongoose.Schema(
  {
    Code: {
      type: String,
      required: true,
      trim: true,
      set: (v) => v.toUpperCase(),
    },
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    CompanyCode: {
      type: String,
      required: true,
      trim: true,
    },
    PrinterIp: {
      type: String,
      required: true,
      trim: true,
    },
    PrinterPort: {
      type: String,
      required: true,
      trim: true,
    },
    ScannerIp: {
      type: String,
      required: true,
      trim: true,
    },
    ScannerPort: {
      type: String,
      required: true,
      trim: true,
    },
    PLCIp: {
      type: String,
      trim: true,
    },
    PLCPort: {
      type: String,
      trim: true,
    },
    Products: {
      type: Array,
      trim: true,
    },
    Active: {
      type: Boolean,
      default: true,
    },
    Status: {
      type: Number,
      default: 1,
    },
    SyncStatus: {
      type: Number,
      default: 0,
    },
    SyncTime: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
lineManagerSchema.plugin(toJSON);
lineManagerSchema.plugin(paginate);

//const LineManager = mongoose.model('lineManager', lineManagerSchema, 'coll_lineManager');
module.exports = { lineManagerSchema };
//module.exports = { LineManager, lineManagerSchema };
