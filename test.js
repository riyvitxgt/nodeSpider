var http = require("http");
var iconv = require('iconv-lite');
var mongoose = require("mongoose");
var ejsExcel = require('ejsexcel');
var fs = require('fs');
var moment = require('moment');
var schedule = require('node-schedule');
var log4js = require('log4js');
var StockSchema = require('./schemas/StockSchema.js');

var CompanySchema = require('./schemas/CompanySchema.js');

log4js.configure({
	appenders:[
		{type:'console'},
		{type:'file', filename:'logs/error.log',category:'dbError'}
	]
});
var logger = log4js.getLogger('dbError');
logger.setLevel('ERROR');


var db = mongoose.createConnection('mongodb://127.0.0.1:27017/test');
db.on('error',function(error){
	console.log(error);
});

db.once('open', function(callback){

});

var stockCode = mongoose.model('companies', CompanySchema);
console.log(stockCode);
stockCode.find({code:'600570'},function(err,codes){
	if(err) return console.error(err);
	console.log("进行");
	console.log(codes);
});


/*
var stockModel = db.model('stocks',StockSchema);

function getStockMsg(code, callback){
	console.log(code.toString());
	http.get("http://hq.sinajs.cn/list="+code.toString(),function(res){
		res.on('data', function(data){
			console.log(data.length);
			if(data.length < 50){
				console.log('数据返回错误');
			}else{
				var buf = new Buffer(data, 'binary');
				//insertIntoDB(iconv.decode(buf, 'gbk'));
				var result = iconv.decode(buf, 'gbk');
				var stock,stocks = [];
				stock = result.trim().split(';');
				for(var i = 0; i < stock.length -1; i++){
					var stc = stock[i];
					stocks.push(
						stock[i].substring(stc.indexOf('"') + 1,stc.length -1) 
						+ "," +
						stock[i].substring(stc.indexOf("hq_str_") + 9,stc.indexOf("="))
					);
				}
				insertIntoDB(stocks);
			}
		});
	});
}

function insertIntoDB(data){
	for(var i = 0; i < data.length; i++){
		var msg = data[i].split(",");
		var sql = '';
		for(var j = 0; j < 10; j++){
			var key = '';
			switch(j){
				case 0:
					key = "stockName:";
					break;
				case 1:
					key = "open:";
					break;
				case 2:
					key = "close:";
					break;
				case 3:
					key = "nowPric:";
					break;
				case 4:
					key = "high:";
					break;
				case 5:
					key = "low:";
					break;
				case 6:
					key = "buyPric:";
					break;
				case 7:
					key = "sellPric:";
					break;
				case 8:
					key = "dealCount:";
					break;
				case 9:
					key = "dealPric:";
					break;
			}
			var value = '';
			if(j == 0){
				value = key + "'" + msg[0] + "'";
			}else{
				value = key + msg[j];
			}
			if(j == 0){
				sql += ("{" + value);
			}else{
				sql += ("," + value);
			}
		}
		sql += ",stockCode:" + msg[33] + ", freshDate: "+ moment(msg[30]) + "}";
		stockModel.create(eval("(" + sql + ")"), function(err){
			if(err){
				logger.error(err);
				logger.error(sql);
			}else{
				console.log("save successed");
			}
		});
	}
	
}


//从指定的excel文件中导出股票代码
function getStockCode(filePath){
	var exlBuf = fs.readFileSync(filePath);
	ejsExcel.getExcelArrCb(exlBuf, function(exlJson){
		var stockArr = [];
		
		for(var i = 0; i < exlJson[0].length; i++){
			var stockNow = exlJson[0][i][2];
			if(stockNow.indexOf(6) == 0 && stockNow.length == 6){
				stockArr.push('sh' + stockNow);
			}
		}
		var code = '';
		var start = 0, end = 10;		
		for(; end < stockArr.length - 1; end = end + 10){
			if(start < stockArr.length -1 && end >= stockArr.length){
				end  = stockArr.length -1;
			}
			getStockMsg(stockArr.slice(start,end),function(msg){
					console.log(msg);
			});
			start = end;
		}
	});
}

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1,5)];
rule.hour = 17;
rule.minute = 43;


schedule.scheduleJob(rule,function(){
	getStockCode('D:/bb.xlsx');
});

*/