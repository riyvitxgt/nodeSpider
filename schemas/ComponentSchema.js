/**
 * Created by zhukm on 2015/4/9.
 */
var mongoose = require('mongoose');

var ComponentSchema = new mongoose.Schema({
    symbol : {type : String},
    name : {type : String}
});

module.exports = ComponentSchema;
