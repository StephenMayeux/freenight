var mongoose = require('mongoose');

var barSchema = mongoose.Schema({
  name: String,
  users: Array
});

module.exports = mongoose.model('Bar', barSchema);
