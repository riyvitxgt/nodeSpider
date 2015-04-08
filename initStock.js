/**
 * Created by zhukm on 2015/3/24.
 */
var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var moment = require('moment');
var ejsExcel = require('ejsexcel');
var mongoose = require("mongoose");

var db = mongoose.createConnection("mongodb://127.0.0.1:27017/test");
db.on('error',function(error){
    console.log(error);
});


//构造一个表
var mongooseSchema = new mongoose.Schema({
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

var mongooseModel = db.model('companies',mongooseSchema);

readCode("./bb.xlsx");



function initComMsg(code){
    http.get("http://stockdata.stock.hexun.com/gszl/s" + code +".shtml",function(res){
        var bHtml = [];
        res.on('data',function(data){
            bHtml.push(data);
        });
        res.on('end',function(){
            var buf = Buffer.concat(bHtml);
            //console.log(buf);
            var $=cheerio.load(iconv.decode(buf, 'gbk'));
            var a = $(".tab_xtable td:nth-child(2n)").toArray();
            //console.log($(a[2]).text());
            var sql = '';
            var key = ["code", "company", "regtime", "industry", "address", "regCapital",
                "issueTime", "marketTime", "shares", "totalStock"];
            var index = [1,2,5,6,8,14,19,20,23,24];
            for(var i = 0; i < 10; i++){
                /*if(i == 2 || i == 6 || i == 7){
                 sql += key[i] + ":" + moment($(a[index[i]]).text()) + ",";
                 }else*/
                var value = $(a[index[i]]).text().replace(/,/g,'');
                if(i == 5 || i == 8){
                    sql += key[i] + ":'" + value.substring(0,value.length - 2) + "',";
                }else if(i == 9){
                    sql += key[i] + ":'" + value.substring(0,value.length - 2) + "'";
                }else{
                    sql += key[i] + ":'" + value + "',";
                }
            }
            sql = "{" + sql + "}";
            //console.log(sql);
            mongooseModel.create(eval("(" + sql + ")"), function(err){
                if(err){
                    console.log(err);
                    console.log(sql);
                }else{
                    console.log("save successed");
                }
            });
        });
    });
}


function readCode(filePath){
    var exlBuf = fs.readFileSync(filePath);
    ejsExcel.getExcelArrCb(exlBuf, function(exlJson){
        for(var j = 0; j < exlJson.length; j++){
            for(var i = 0; i < exlJson[j].length; i++){
                var stockNow = exlJson[j][i][2];
                if(stockNow.indexOf(6) == 0 && stockNow.length == 6){
                    initComMsg(stockNow);
                }
            }
        }
        return;
    });

}

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

