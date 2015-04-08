/**
 * Created by King on 2015/3/29.
 */
var mongoose = require('mongoose');

var StockSchema = new mongoose.Schema({
    stockName : {type:String},
    open 	  : {type:Number},
    close 	  : {type:Number},
    nowPric   : {type:Number},
    high	  : {type:Number},
    low 	  : {type:Number},
    buyPric   : {type:Number},
    sellPric  : {type:Number},
    dealCount : {type:Number},
    dealPric  : {type:Number},
    stockCode : {type:Number},
    freshDate : {type:Date}
});

module.exports = StockSchema;
