require('dotenv').config();;
const cors = require('cors'); require('./config/db');
const express = require('express');
const auth = require('./routes/auth');
const app = express();
const profile = require('./routes/profile');
const adminauth = require('./routes/adminauth');
const product = require('./routes/product');
const customer = require('./routes/customer');
const usershowproduct = require('./routes/productshow');
const path=require('path');
const cart=require('./routes/cart');
const order=require('./routes/order');
const homeproducts=require('./routes/homeproduct');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/api', auth);

app.use('/api', profile);

app.use('/api/admin', adminauth);

app.use('/api/admin', product);
app.use('/api/admin', customer);

app.use('/api/data', usershowproduct);
app.use('/api/cart', cart);

app.use('/api/order', order);

app.use('/api',homeproducts);


app.listen(PORT, () => {

        console.log("Server is running in:", PORT);

})