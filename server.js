const express =require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const bcrypt = require("bcryptjs");
const Products = require('./Products');
const Users=require('./Users');
const Orders=require('./Orders');
const Stripe = require('stripe')('sk_test_51NYnChSJX7SIh8WdOx0BZJesfTVMPKQXgZWYMBdzJr2xWGyrGAq2Jo7szpmp2xbFaZjRZIKPwMY3I8lokBTIG17R00Q00OjjHT');

const app=express()
const port=8000

// middleware
app.use(express.json())
app.use(cors())

// connection url
const connection_url='mongodb+srv://James98:Amazon@amazon-clone.3qublah.mongodb.net/Amazon-Clone?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

// API
app.get('/',(req,res)=>{
    res.status(200).send("Hello there")
})

// add products
app.post('/products/add',(req,res)=>{
    const details=req.body;

    console.log(details)

    Products.create(details)
    .then((err,data)=>{
        if(err){
            res.send(err.message);
        }else{
            res.send(data)
        }
    })
})

app.get('/products/get',(req,res)=>{
    Products.find()
     .then((err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.send(data)
        }
     })
})

// API signup
app.post("/auth/signup", async (req, res) => {
    const { email, password, fullName } = req.body;
  
    const encrypt_password = await bcrypt.hash(password, 10);
  
    const userDetail = {
      email: email,
      password: encrypt_password,
      fullName: fullName,
    };
  
    const user_exist = await Users.findOne({ email: email });
  
    if (user_exist) {
      res.send({ message: "The Email is already in use !" });
    } else {
      Users.create(userDetail)
        .then((err, result) => {
          if (err) {
            res.send({ message: err.message });
          } else {
            res.send({ message: "User Created Succesfully" });
          }
        });
    }
  });
  
  // API login
  app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
  
    const userDetail = await Users.findOne({ email: email });
  
    if (userDetail) {
      if (await bcrypt.compare(password, userDetail.password)) {
        res.send(userDetail);
      } else {
        res.send({ error: "Invaild Password" });
      }
    } else {
      res.send({ error: "User does not exist" });
    }
  });

// API payment
app.post('/payments/create',async (req,res)=>{
  const total=req.body.amount;
  console.log("Payment request received for amount",total);

  const payment=await Stripe.paymentIntents.create({
    amount:total*100,
    currency:'inr',
  })

  res.status(201).send({
    clientSecret:payment.client_secret,
  })
})

// add order details
app.post('/orders/add',(req,res)=>{
  const products=req.body.basket;
  const price=req.body.price;
  const email=req.body.email;
  const address=req.body.address;

  const orderDetails={
    products:products,
    price:price,
    email:email,
    address:address,
  }

  Orders.create(orderDetails)
    .then((err,result)=>{
      if(err){
        res.send(err);
      }else{
        res.send(result);
      }
    })
});

app.post('/orders/get',(req,res)=>{
  const email=req.body.email;
  Orders.find()
   .then((err,result)=>{
      if(err){
        res.send(err);
      }else{
        const userOrders=result.filter((Order)=>Order.email===email);
        res.send(userOrders);
      }
   });
});

app.listen(port,()=>{
    console.log('Listening on port',port)
})