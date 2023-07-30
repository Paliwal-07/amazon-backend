const mongoose=require('mongoose')

const ProductSchema=mongoose.Schema({
    title:String,
    imageurl:String,
    price:Number,
    rating:Number,
})

module.exports=mongoose.model('products',ProductSchema)