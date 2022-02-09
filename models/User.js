const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email:String,
    firstName:String,
    lastName:String,
    type:String,

})

module.exports = model('User', userSchema);