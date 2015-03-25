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

var StockSchema = require('./schemas/CompanySchema.js');

var db = mongoose.createConnection("mongodb://127.0.0.1:27017/test");
db.on('error',function(error){
    console.log(error);
});
var stockModel = db.model('companies',StockSchema);
db.once('open', function(){
    readCode("./bb.xlsx");
});

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
            stockModel.create(eval("(" + sql + ")"), function(err){
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
        for(var i = 0; i < exlJson[0].length; i++){
            var stockNow = exlJson[0][i][2];
            if(stockNow.indexOf(6) == 0 && stockNow.length == 6){
               initComMsg(stockNow);
            }
        }
        return;
    });

}



