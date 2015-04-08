/**
 * Created by zhukm on 2015/4/8.
 */
var http = require('http');
var fs = require('fs');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');

getCompanyArray();

function getCompanyArray(){
    var comAbbrs = [];
    http.get("http://finance.yahoo.com/q/cp?s=%5EDJI+Components",function(res){
       var htmlArr = [];
        res.on('data' ,function(data){
            htmlArr.push(data);
        });
        res.on('end', function(){
            var buf = Buffer.concat(htmlArr);
            var $=cheerio.load(iconv.decode(buf, 'gbk'));
            var htmlContent = $(".yfnc_tabledata1");
            var comAbbrs = [];
            for(var i = 0; i < htmlContent.length; i++){
                if(i % 5 == 0){
                   downloadCSV($(htmlContent[i]).text());
                }
            }
        });
    });
}


function downloadCSV(comAbbrs){

    http.get('http://finance.yahoo.com/q/hp?s=' + comAbbrs + '+Historical+Prices',function(res){
        var htmlArr = [];
        res.on('data' ,function(data){
            htmlArr.push(data);
        });
        res.on('end', function(){
            var buf = Buffer.concat(htmlArr);
            var $=cheerio.load(iconv.decode(buf, 'gbk'));
            var htmlContent = $(".yfncsumtab p a").attr("href");
            console.log(htmlContent);
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
