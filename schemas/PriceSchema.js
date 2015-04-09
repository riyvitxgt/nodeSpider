/**
 * Created by zhukm on 2015/4/9.
 */
var mongoose = require('mongoose');

var PriceSchema = new mongoose.Schema({
    data:          {type: Date},
    open:          {type: Number},
    high:          {type: Number},
    low:           {type: Number},
    close:         {type: Number},
    volume:        {type: Number},
    adjClose:      {type: Number},
    companySymbol: {type: String}
});

module.exports = PriceSchema;