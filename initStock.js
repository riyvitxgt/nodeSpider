/**
 * Created by zhukm on 2015/3/24.
 */
var http = require('http');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
http.get("http://stockdata.stock.hexun.com/gszl/s600708.shtml",function(res){
    res.on('data',function(data){
        console.log(res);
        var buf = new Buffer(data, 'binary');
        var $=cheerio.load(iconv.decode(buf, 'gbk'));
        console.log($("table").text());

    });
});