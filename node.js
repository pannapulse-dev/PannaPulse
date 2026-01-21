// Imports

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const jwt = require('jsonwebtoken');
const { type } = require('os');
const { create } = require('domain');
const path = require('path');

const {Resend} = require('resend');

const resend = new Resend('re_JFzwT6cd_KvR2RvU1kd3gW1ZvRoGkGSLY')

const app = express();

const Port = process.env.PORT || 5400;


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Multer

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder: 'PannaPulse_Uploads',
        allowed_formats: ['jpg', 'png', 'JPG', 'jpeg', 'jfif'],
    }
});

const upload = multer({ 
    storage: storage,
});

// DB connection

const uri = process.env.MONGO_URI;
let db;

mongoose.connect(uri)
.then(()=> console.log('Connected to MongoDB'))
.catch((err)=> console.log('Error', err));

// Otp generator

const generateOTP = ()=>{
    return Math.floor(100000 + Math.random()*900000)
};
let otpStore = {};

const saveOTP = async(email, otp)=>{
    try{
        const collection = db.collection('otps');
        await collection.insertOne({
            email: email,
            otp: otp,
            createAt: new Date()
        });
        console.log('otp saved to db')
    }catch(err){
        console.log('failed to save otp', err)
    }
}

// Node mailer

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps bypass some network restrictions
    }
});

// MongooseSchema

const userSchema = new mongoose.Schema({
    firstname : {type : String, required : true},
    lastname : {type : String, required : true},
    mobile: {type: Number, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    address: {type: String, required: false},
    profile: {type: String, default: ''}
});
const users = mongoose.model('users', userSchema);

const shopSchema = new mongoose.Schema({
    Shopname : {type: String, required: true},
    type: {type: String, required: true},
    WAno : {type: Number, unique: true, required: true},
    Shopaddress : {type: String, required: true, unique: true},
});
const shops = mongoose.model('shops', shopSchema);

const itemSchema = new mongoose.Schema({
    name : {type: String, required: true},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    quantityType: {type: String, required: true},
    Image: {type: String, required: true},
    shopId: {type:mongoose.Schema.Types.ObjectId, ref: 'shops'},
    category: {type: String, required: true, enum: ['Food and snacks','Groceries']}
});
const itemList = mongoose.model('itemList', itemSchema);

// Signup Authentication

app.post('/auth/signup', async (req, res) => {
    const { firstname, lastname, mobile, email, otp } = req.body;
    
    if (otpStore[email] && otpStore[email] == otp) {
        try {
            const newUser = new users(req.body);
            await newUser.save();
            
            const token = jwt.sign(
                { email: email, id: newUser._id },
                process.env.USER_JWT_SECRET,
                { expiresIn: '1h' }
            );

            delete otpStore[email];
            res.json({
                message: 'Welcome to PannaPulse',
                token: token,
                user: newUser 
            });
        } catch (err) {
            console.log('Signup error:', err);
            res.status(400).json({ error: 'Email or Mobile number already exists' });
        }
    } else {
        res.status(400).json({ error: 'OTP is invalid or expired' });
    }
});

// Signup otp

app.post('/auth/send-signup-otp', async (req, res)=>{
    const {email} = req.body
    if(!email){
        return res.status(400).json({message: 'email is required'});
    }
    const otp = generateOTP();
    otpStore[email] = otp;

const mailOptions = await resend.emails.send({
    from: `"PannaPulse Support" <onboarding@resend.dev>`,
    to: email,
    subject: `${otp} is your PannaPulse verification code`, 
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">PannaPulse</h1>
        </div>
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
            <h2 style="color: #2c3e50;">Verify your email</h2>
            <p>Thank you for choosing <strong>PannaPulse</strong>. Use the code below to complete your authentication process:</p>
            <div style="background-color: #f8f9fa; border: 1px dashed #2c3e50; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #666666;">This code will expire shortly. If you did not request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
            &copy; 2025 PannaPulse Services. All rights reserved.
        </div>
    </div>
    `
});
    try{
        res.status(200).json({message: 'OTP sent successfully'})
    }catch(err){
        console.log('mail error', err);
        res.status(400).json({message: 'failed to send otp'})
    };
});

// Login Authentication

app.post('/auth/userlogin', async (req, res)=>{
    const {email, otp} = req.body;
    if(otpStore[email] && otpStore[email] == otp){
        const token = jwt.sign(
            {email: email},
            process.env.USER_JWT_SECRET,
            {expiresIn: '1h'}
        );
        const user = await users.findOne({email : email})
        if(user){
            res.status(200).json({
                message: `Welcome Back ${user.firstname}!`,
                user: user,
                token: token
            });
            delete otpStore[email];
        }else{
            res.status(400).json({message: 'User not found'})
        }
    }else{
        res.status(400).json({error: 'Wrong otp entered'})
    }
});

// login send otp

app.post('/auth/send-login-otp', async (req, res)=>{
    const {email} = req.body
    if(!email){
        return res.status(400).json({message: 'email is required'});
    }
    try{
        const user = await users.findOne({email});
        if(!user){
            return res.status(400).json({message: 'user not found'})
        }
        const otp = generateOTP();
        otpStore[email] = otp;

        const mailOptions = await resend.emails.send({
    from: `"PannaPulse Support" <onboarding@resend.dev>`,
    to: email,
    subject: `${otp} is your PannaPulse verification code`, 
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">PannaPulse</h1>
        </div>
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
            <h2 style="color: #2c3e50;">Verify your email</h2>
            <p>Thank you for choosing <strong>PannaPulse</strong>. Use the code below to complete your authentication process:</p>
            <div style="background-color: #f8f9fa; border: 1px dashed #2c3e50; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #666666;">This code will expire shortly. If you did not request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
            &copy; 2025 PannaPulse Services. All rights reserved.
        </div>
    </div>
    `
    });
    res.status(200).json({message: 'OTP sent successfully'})
    }catch(err){
        res.status(500).json({message: 'failed to send otp'})
    };
});

// Add address

app.post('/add-address', async (req, res)=>{
    const {address, token} = req.body;
    if(!token){
        res.status(400).json({error: 'Unauthorized user'});
    }
    const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
    const email = decoded.email;

    const updatedUser = await users.findOneAndUpdate(
        {email: email},
        {$set: {address: address}},
        {new: true}
    );
    if(updatedUser){
        res.status(200).json({message: 'Address updated successfully', user: updatedUser});
    }else{
        res.status(404).json({error: 'User not found'});
    }
})

// Shop authentication

app.post('/auth/shop', async (req, res) =>{
    const {Shopname, WAno, Shopaddress, Password, type} = req.body;

    const tokenShop = jwt.sign(
        {WAno: WAno},
        process.env.SHOP_JWT_SECRET,
        {expiresIn: '1h'}
    );
    try{
        const newShop = new shops(req.body);
        await newShop.save();
        res.json({
            message: "Thank you! for joining us",
            token: tokenShop,
            shop: newShop
        })
    }catch(err){
        console.log('Mongoose error', err);
        res.status(400).json({error: 'Mobile no. already exists'});
    }
});

app.get('/get-shops', async (req, res)=>{
    try{
        const shopsDetails = await shops.find();
        res.status(200).json(shopsDetails)
    }catch(err){
        console.log('Error fetching data:', err);
        res.status(500).json({error: 'Failed to fetch shops'});
    }
});

// Login Shop

app.post('/auth/shoplogin', async (req, res)=>{
    const {WAno, Password} = req.body;
    if (!WAno, !Password) {
        return res.status(400).json({ error: "Mobile number and password are required" });
    }
    try{
        const shop = await shops.findOne({ WAno: Number(WAno)} );
        if(!shop){
            return res.status(404).json({error: 'Wrong Mobile Number'});
        }
        const tokenShop = jwt.sign(
            {WAno: WAno},
            process.env.SHOP_JWT_SECRET,
            {expiresIn: '1h'}
        );
        res.status(200).json({
            message: `Welcome back, ${shop.Shopname}!`,
            token: tokenShop,
            shop: shop,
            shopId: shop._id,
            shopName: shop.Shopname
        });
    }catch(err){
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Profile save

app.post('/add-profile', upload.single('profile'), async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Unauthorized user!' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Verify token safely
        const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
        const email = decoded.email;
        const profilePath = req.file.path;

        const updatedUser = await users.findOneAndUpdate(
            { email: email },
            { $set: { profile: profilePath } },
            { new: true }
        );

        if (updatedUser) {
            res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Product add 

app.post('/add-product', upload.single('Image'), async (req, res)=>{
    try{
        const {name, price, quantity, quantityType, category, shopId} = req.body;

        const newProduct = new itemList({
            name, price, quantity, quantityType, category, shopId,
            Image: req.file.path
        });
        const savedProduct = await newProduct.save();

        res.status(200).json(savedProduct);
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to upload product', details: err.message });
    }
})

// product display

app.get('/get-products', async (req, res) => {
    try {
        const products = await itemList.find().populate('shopId'); 
        res.status(200).json(products);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// all Products details shop

app.get('/shop/shopall-products', async (req, res) => {
    try {
        const { shopId } = req.query;
        if (!shopId) {
            return res.status(400).json({ error: "Shop ID is required" });
        }
        
        const products = await itemList.find({ shopId: shopId }).populate('shopId');
        res.status(200).json(products);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// product preview

app.get('/api/products/:id', async (req, res) => {
    try {
        const item = await itemList.findById(req.params.id).populate('shopId');
        if (!item) return res.status(404).json({ error: "Item not found" });
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// remove product

app.delete('/shop/remove-product/:id', async (req, res)=>{
    try{
        const item = await itemList.findByIdAndDelete(req.params.id).populate('shopId');
        if(item) return res.status(200).json({message: 'Product deleted successfully!'});
        if(!item) return res.status(404).json({error: 'Product not found'});
    }catch(err){
        res.status(500).json({error: 'Server Error'})
    }
});

// update product

app.patch('/shop/update-product/:id', async (req, res)=>{
    try{
        const {price} = req.body;
        const item = await itemList.findByIdAndUpdate(req.params.id, 
            { price: price }, 
            { new: true }
        ).populate('shopId');
        if(!item) return res.status(404).json({error: 'Product not found'});

        res.status(200).json({ 
            message: 'Product updated successfully!',
            data: item 
        });
    }catch(err){
        res.status(500).json({error: 'Server Error'})
    }
});

// order

app.post('/place-order', async (req, res) => {
    const { customer, items, total } = req.body;

    const productListHTML = items.map(item => 
        `<li>${item.name} (x${item.quantity}) from <b>${item.shopName || 'General Store'} ${item.shopNumber} ${item.shopAdd}</b></li>`
    ).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Order from ${customer.name}`,
        html: `
            <h3>New Order Received</h3>
            <p><b>Customer:</b> ${customer.name} (${customer.mobile})</p>
            <p><b>Address:</b> ${customer.address}</p>
            <ul>${productListHTML}</ul>
            <p><b>Total Amount:</b> ${total}</p>
            <hr>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Order processed" });
});

app.get('/order-action', (req, res) => {
    const { action, id } = req.query;
    res.send(`<h1>Order ${id} has been ${action}ed successfully!</h1>`);
});

app.post('/place-orderpreview', async (req, res) => {
    const { customer, items, total } = req.body;

    const productListHTML = items.map(item => 
        `<li>${item.name} (x${item.quantity}) from <b>${item.shopName || 'General Store'} ${item.shopNumber} ${item.shopAdd}</b></li>`
    ).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Your admin email
        subject: `New Order from ${customer.name}`,
        html: `
            <h3>New Order Received</h3>
            <p><b>Customer:</b> ${customer.name} (${customer.mobile})</p>
            <p><b>Address:</b> ${customer.address}</p>
            <ul>${productListHTML}</ul>
            <p><b>Total Amount:</b> ${total}</p>
            <hr>
            <div style="display: flex; gap: 10px;">
                <a href="http://localhost:3000/order-action?action=confirm&id=123" 
                   style="background: green; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">
                   Confirm Order
                </a>
                <a href="http://localhost:3000/order-action?action=decline&id=123" 
                   style="background: red; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">
                   Decline Order
                </a>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Order processed" });
});

app.get('/:shop_id/get-products', async (req, res)=>{
    try{
        const item = await itemList.find({shopId: req.params.shop_id}).populate('shopId')
        if(!item){
            return res.status(404).json({error: "Not found"})
        }
        res.status(200).json(item)
    }catch(err){
        res.status(500).json({error: 'server error'})
    }
})

// server listener

app.listen(Port, '0.0.0.0', ()=>{
    console.log(`Server is live on localhost:${Port}`);

});






