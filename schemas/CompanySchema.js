/**
 * Created by King on 2015/3/29.
 */
var mongoose = require('mongoose');

var CompanySchema = new mongoose.Schema({
    code      : {type:String},
    company   : {type:String},
    regtime   : {type:Date},
    industry  : {type:String},
    address	  : {type:String},
    regCapital: {type:Number},
    issueTime : {type:Date},
    marketTime: {type:Date},
    shares    : {type:Number},
    totalStock: {type:Number}
});

module.exports = CompanySchema;

