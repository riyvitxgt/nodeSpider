/**
 * Created by zhukm on 2015/4/8.
 */
var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var moment = require('moment');


var db = mongoose.createConnection("mongodb://127.0.0.1:27017/test");
db.on('error', function(err){
    console.log(err);
});
db.once('open', function(){
    //downloadCSV();
    getCompanyArray();
});


/**
 * 爬取IXIC（纳斯达克）公司名和公司简称，并存来components数据库中
 */
function getCompanyArray(){
    var ComponentSchema = require('./schemas/ComponentSchema.js')
    db.model('Component', ComponentSchema);
    var Component = db.model('Component');
    var comArr = [];
    for(var i = 0; i <= 51; i++){
        var url = "http://finance.yahoo.com/q/cp?s=%5EIXIC&c=" + i;
        //console.log(url);
        http.get(url, function(res){
            var htmlArr = [];
            res.on('data', function(data){
                htmlArr.push(data);
            });
            res.on('end', function(){
                var buf = Buffer.concat(htmlArr);
                var $ = cheerio.load(iconv.decode(buf, 'gbk'));
                var htmlContent = $(".yfnc_tabledata1");
                for(var i = 0; i < htmlContent.length; i++){
                    if(i % 5 == 0){
                        var newComponent = new Component();
                        newComponent.symbol = $(htmlContent[i]).text();
                        newComponent.name = $(htmlContent[i+1]).text();
                        comArr.push(newComponent);
                        if(comArr.length > 100 || i == htmlContent.length -1){
                            Component.create(comArr, function(err){
                                if(err){
                                    console.log(err);
                                }
                            });
                            comArr = [];
                        }
                    }
                }
            })
        });
    }
   /* http.get("http://finance.yahoo.com/q/cp?s=%5EDJI+Components",function(res){
       var htmlArr = [];
        res.on('data' ,function(data){
            htmlArr.push(data);
        });
        res.on('end', function(){
            var buf = Buffer.concat(htmlArr);
            var $=cheerio.load(iconv.decode(buf, 'gbk'));
            var htmlContent = $(".yfnc_tabledata1");
            downloadCSV($(htmlContent[0]).text());
            *//*for(var i = 0; i < htmlContent.length; i++){
                if(i % 5 == 0){
                   downloadCSV($(htmlContent[i]).text());
                }
            }*//*
        });
    });*/
}


function downloadCSV(){
    var ComponentSchema = require('./schemas/ComponentSchema.js')
    var Component = db.model('Component', ComponentSchema);
    Component.find(function(err, com){
        if(err){
            console.error(err);
        }else{
            //console.log(com[0].symbol);
            //insertPrice(com[0].symbol);
            for(var i = 0; i < com.length; i++){
                //insertPrice(com[i].symbol);
                insertPreDay(com[i].symbol);
            }
            console.log('insert success');
        }
    });
}

function insertPrice(symbol){
    var PriceSchema = require('./schemas/PriceSchema.js');
    db.model('Prices', PriceSchema);
    var Price = db.model('Prices');

    var htmlContent = "http://real-chart.finance.yahoo.com/table.csv?s=" + symbol + "&amp;a=03&amp;b=8&amp;c=1980&amp;d=03&amp;e=9&amp;f=2015&amp;g=d&amp;ignore=.csv"
    //console.log(htmlContent);
    http.get(htmlContent,function(res){
        var dataArr = [];
        res.on('data',function(data){
            dataArr.push(data);
        });
        res.on('end',function(){
            var buf = Buffer.concat(dataArr);
            var arr = iconv.decode(buf,'gbk');
            //fs.writeFileSync("D://" + comAbbrs + ".csv", buf);
            var arr = iconv.decode(buf,'gbk').trim();
            arr = arr.substring(arr.indexOf("\n") + 1,arr.length);
            var strArr = arr.split("\n");
            var priceArr = [];
            for(var i = 0; i < strArr.length; i++){
                var newPrice = new Price();
                priceContent = strArr[i].split(',');
                newPrice.data = priceContent[0];
                newPrice.open = priceContent[1];
                newPrice.high = priceContent[2];
                newPrice.low = priceContent[3];
                newPrice.close = priceContent[4];
                newPrice.volume = priceContent[5];
                newPrice.adjClose = priceContent[6];
                newPrice.companySymbol = symbol;
                priceArr.push(newPrice);
                if(priceArr.length > 50){
                    Price.create(priceArr, function(err){
                        if(err) {
                            console.log(err);
                        }
                    })
                    priceArr = [];
                }
            }
        });
    });


}


function insertPreDay(companySymbol){
    var today = new Date();
    var tYear = today.getFullYear();
    var tMonth = today.getMonth() > 10 ? today.getMonth() : "0" + today.getMonth();
    var tDay = today.getDate();
    var yesterday_milliseconds = today.getTime() - 1000*60*60*24;
    var yesterday = new Date();
    yesterday.setTime(yesterday_milliseconds);

    var yYear = yesterday.getFullYear();
    var yMonth = yesterday.getMonth() > 10 ? today.getMonth() : "0" + today.getMonth();
    var yDay = yesterday.getDate();

    var url = "http://real-chart.finance.yahoo.com/table.csv?s=" + companySymbol +
        "&amp;d=" + tMonth + "&amp;e=" + tDay + "&amp;f=" + tYear + "&amp;g=d&amp;" +
        "a=" + yMonth +"&amp;b=" + yDay +"&amp;c=" + yYear + "&amp;ignore=.csv";

    var PriceSchema = require('./schemas/PriceSchema.js');
    db.model('Prices', PriceSchema);
    var Price = db.model('Prices');

    http.get(url,function(res){
        var dataArr = [];
        res.on('data',function(data){
            dataArr.push(data);
        });
        res.on('end',function(){
            var buf = Buffer.concat(dataArr);
            var arr = iconv.decode(buf,'gbk');
            //fs.writeFileSync("D://" + comAbbrs + ".csv", buf);
            var arr = iconv.decode(buf,'gbk').trim();
            arr = arr.substring(arr.indexOf("\n") + 1,arr.length);
            var strArr = arr.split("\n");
            //var priceArr = [];
            for(var i = 0; i < strArr.length; i++){
                var newPrice = new Price();
                priceContent = strArr[i].split(',');
                newPrice.data = priceContent[0];
                newPrice.open = priceContent[1];
                newPrice.high = priceContent[2];
                newPrice.low = priceContent[3];
                newPrice.close = priceContent[4];
                newPrice.volume = priceContent[5];
                newPrice.adjClose = priceContent[6];
                newPrice.companySymbol = companySymbol;
                newPrice.save(function(err){
                    console.log(err);
                });
                //priceArr.push(newPrice);
                /*if(priceArr.length > 50){
                    Price.create(priceArr, function(err){
                        if(err) {
                            console.log(err);
                        }
                    })
                    priceArr = [];
                }*/
            }
        });
    });


}
/*http.get('http://real-chart.finance.yahoo.com/table.csv?s=AXP&amp;d=3&amp;e=8&amp;f=2015&amp;g=d&amp;a=5&amp;b=1&amp;c=1972&amp;ignore=.csv',function(res){
    var dataArr = [];
    res.on('data',function(data){
       dataArr.push(data);
    });
    res.on('end',function(){
        var buf = Buffer.concat(dataArr);
        fs.writeFileSync("D://b.csv", buf);
    });
});*/

//http://real-chart.finance.yahoo.com/table.csv?s=AAL&amp;a=03&amp;b=8&amp;c=2015&amp;d=03&amp;e=9&amp;f=2015&amp;g=d&amp;ignore=.csv

//http://real-chart.finance.yahoo.com/table.csv?s=AAL&amp;d=03&amp;e=9&amp;f=2015&amp;g=d&amp;a=03&amp;b=8&amp;c=2015&amp;ignore=.csv
