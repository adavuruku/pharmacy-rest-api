require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')
const fileUpload = require('express-fileupload')

// https://mubarak-pharmacy.herokuapp.com/

// 1. Buying/Selling (Inventory)
// 2. Chat with pharmacy for drug prescription
// 3. Delivery of cart(products)
// 4. Transaction history
// 5. Customer registration
// 6. Staff Registration.
// 5. Branch Registration
// UsersInformation, Inventory, Transaction, Customer, Branchs, Conversation, InventoryCategory

const app = express();

app.use(cors({
    origin:"*"
}));
app.use(fileUpload({useTempFiles:true}))
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());



const usersRoutes = require('./app/routes/userRoute');
// const ninRoutes = require('./app/routes/ninRoute');

// heroku platform is the sanienesi@gmail.com
app.use('/api/user',usersRoutes);
// app.use('/api/user',ninRoutes);

app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status=404;
    next(error);
});


app.use((error, req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error : {
            message: error.message
        }
    });
});

module.exports = app;