/**
 * Created by zhukm on 2015/3/25.
 */
var mongoose = require('mongoose');

var StockSchema = mongoose.Schema({
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

//1 股票代码   code
//2 公司全称   company
//5 成立时间   regtime
//6 所属行业   industry
//8 所属地域   address
//14 注册资本  regCapital
//19 发行日期  issueTime
//20 上市日期  marketTime
//23 流通股本  shares
//24 总股本    totalStock