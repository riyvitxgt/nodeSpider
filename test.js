var http = require("http");
var iconv = require('iconv-lite');
var mongoose = require("mongoose");
var ejsExcel = require('ejsexcel');
var fs = require('fs');



var db = mongoose.createConnection('mongodb://127.0.0.1:27017/test');
db.on('error',function(error){
	console.log(error);
});

var mongooseSchema = new mongoose.Schema({
	stockName : {type:String},
	open 	  : {type:Number},
	close 	  : {type:Number},
	nowPric   : {type:Number},
	high	  : {type:Number},
	low 	  : {type:Number},
	buyPric   : {type:Number},
	sellPric  : {type:Number},
	dealCount : {type:Number},
	dealPric  : {type:Number}
});

var mongooseModel = db.model('mongoose',mongooseSchema);

var express = require("express");
var app = express();

app.get('/',function(req, res){
	console.log("come in  >>>>>>>>>>>>");
	var code = getStockCode('D:/bb.xlsx');
	getStockCode('D:/bb.xlsx');
	
});



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
					stocks.push(stock[i].substring(stock[i].indexOf('"') + 1,stock[i].length -1));		
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
		//console.log(msg.length);
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
			}else if(j == 9){
				sql += ("," + value + "}");
			}else{
				sql += ("," + value);
			}
		}
		//console.log(eval("(" +sql + ")"));
		/*var mongooseEntity = new mongooseModel(eval("(" +sql + ")"));
		mongooseEntity.save(function(error){
			console.log('aaa');
			if(error){
				console.log(error);
			}else{
				console.log("saved success");
			}
			
		});*/
		mongooseModel.create(eval("(" + sql + ")"), function(err){
			if(err){
				console.log(err);
			}else{
				console.log("save successed");
			}
		});
	}
	
}

/*
getStockMsg('sh601006,sh600029,sh601218',function(msg){
	console.log(msg.toString());
});
*/

//从指定的excel文件中导出股票代码
function getStockCode(filePath){
	console.log(filePath);
	
	var exlBuf = fs.readFileSync(filePath);
	ejsExcel.getExcelArrCb(exlBuf, function(exlJson){
		var stockArr = [];
		for(var i = 0; i < exlJson[0].length; i++){
			var stockNow = exlJson[0][i][2];
			//console.log(stockNow);
			if(stockNow.indexOf(6) == 0){
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
					//console.log(msg.toString());
			});
			start = end;
		}
		// for(var i = 0; i < stockArr.length; i++){
			// if(i == 0){
				// code = stockArr[0];
			// }else{
				// code += (',' + stockArr[i])
			// }
			// if(i % 10 == 0){
				// console.log(code);
				// getStockMsg(code,function(msg){
					// console.log(msg);
					console.log(msg.toString());
				// });
				
			// }
		// }
		
	});
}





app.listen(3000, function(){
	console.log('server start on port 3000');
});