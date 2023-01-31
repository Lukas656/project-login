const mongoose = require('mongoose');

const Login = mongoose.model('ValidaLogin', {
    email: String,
    password: String
})

module.exports = Login