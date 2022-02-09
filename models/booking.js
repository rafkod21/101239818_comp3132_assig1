const { model, Schema } = require('mongoose');

const bookingSchema = new Schema({
    listing_id: String,
    listing_title: String,
    description: String,
    street: String,
    city: String,
    postalCode: String,
    price:Number,
    email: String,
    username:String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = model('Booking', bookingSchema);