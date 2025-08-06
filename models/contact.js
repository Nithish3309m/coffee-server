const mongoose = require('mongoose');

const contactschema = mongoose.Schema({
    name: String,
    email: String,
    message: String

})

module.exports = mongoose.model('contact', contactschema);