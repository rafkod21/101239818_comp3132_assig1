const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require("apollo-server");

const Booking = require('./models/booking');
const User = require('./models/User')
const {validateRegisterInput} = require("./utils/validator");
const {validateLoginInput} = require("./utils/login");
const checkAuth = require('./utils/checkAuth');




const typeDefs = gql`
    type Booking {
        id: ID!
        listing_id: String!
        listing_title: String!
        description: String!
        street: String!
        city: String!
        postalCode: String!
        price: Float!
        email: String!
        username: String!
    }
    type User{
        id: ID!
        email: String!
        token: String!
        type: String!
        username: String!
    }
    input RegisterInput{
        username:String!
        password: String!
        firstName:String!
        lastName: String!
        type: String!
        confirmPassword: String!
        email: String!
    }
    input SearchInput{
        city: String!
       
    }
    type Query {
        getBookings: [Booking]
        getBooking(bookingId: ID!): Booking
        getAllBookingsByUser: [Booking]
        getAllBookingsByAdmin: [Booking]
        searchBookings(input: SearchInput!): [Booking]
    }
    type Mutation{
        register(registerInput: RegisterInput): User! 
        login(username: String!, password:String!): User!
        createBookingByUser(listing_id: String! , listing_title: String!, description: String!, street: String!, city: String!): Booking!
        createBookingByAdmin(listing_id: String! , listing_title: String!, description: String!, street: String!, city: String!, price: Float!,postalCode: String!): Booking!
    }
`;

var SECRET = "HEHEHE";

function generateToken(res){
    return jwt.sign({
        id: res.id,
        email: res.email,
        username: res.username,
        type: res.type
    },SECRET, {
        expiresIn:'1h'
    })
}
const resolvers = {
    Query: {
        async getBookings() {
            try {
                const bookings = await Booking.find();
                return bookings;
            }
            catch(err){
                throw new Error(err);
            }
        },
        async searchBookings(_,{input: {city}},context) {
         const bookings = await Booking.find({city});
         return bookings;
        },
        async getAllBookingsByUser(_,{},context){
            const object = checkAuth(context);
            const user = object.id;
            try {
                if(object.type == 'user' || object.type == 'customer' )
                {
                const bookings = await Booking.find({user});
                return bookings;
                }
                else
                {
                    throw new UserInputError('Please provide valid user token');
                }
            }
            catch(err){
                throw new Error(err);
            }
        },
        async getAllBookingsByAdmin(_,{},context){
            const object = checkAuth(context);
            const user = object.id;
            try {
                if(object.type == 'admin')
                {
                const bookings = await Booking.find({user});
                return bookings;
                }
                else
                {
                    throw new UserInputError('Please provide valid admin token');
                }
            }
            catch(err){
                throw new Error(err);
            }
        },
        async getBooking(_, { bookingId }){
            try{
                const booking = await Booking.findById(bookingId);
                if(booking)
                {
                    return booking;
                }
                else{
                    throw new Error('Booking not Found')
                }
            } catch(err){
                throw new Error(err);
            }
        }
    },

    Mutation: {
        async login(_,{username, password}){

            const { valid, errors} = validateLoginInput(username,password);


            if(!valid){
                throw new UserInputError('Errors',{errors})
            }

            const user = await User.findOne({username});

            if(!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found!!',{errors});
            }
        const match = await bcrypt.compare(password,user.password);
        if(!match)
        {
            errors.general = 'Wrong Credentials';
            throw new UserInputError('Wrong Credentials!!!',{errors});
        }
        const token = generateToken(user);

        return {
            ...user._doc,
            id: user._id,
            token,
            type: user.type
        };


        },
       async register(_,{ registerInput: { username, email, password, confirmPassword, type }}
            ,context,info){
            // TODO: VALIDATE USER DATA
            // TODO: MAKE SURE USER DOESNT ALREADY EXIST
            // TODO: HASH PASS AND CREATE AN AUTH TOKEN
            const { valid, errors} = validateRegisterInput(username,email,password,confirmPassword,type);
            if(!valid){
                throw new UserInputError('Errors', { errors })
            }
            const user = await User.findOne({ username})
            if(user){
                throw new UserInputError('Username is taken',{
                    errors:{
                        username: 'This username is already taken!!!'
                    }
                })
            }
            password = await bcrypt.hash(password,12);

            const newUser = new User({
                email,
                username,
                password,
                type
            })
            const res = await newUser.save();

            const token = generateToken(res);
            return {
                ...res._doc,
                id: res._id,
                token,
                type: res.type
            }
        },
        async createBookingByUser(_,{listing_id,listing_title,description,street,city},context){
            const user = checkAuth(context);
            console.log(user);
            console.log('this is user',user);
            console.log('he',context)
            if(user.type == 'user')
        {
            const newBooking = new Booking({
                listing_id,
                listing_title,
                description,
                street,
                city,
                user: user.id,
                username: user.username,
                email: user.email,
                type: user.type,
            });
            const booking = await newBooking.save();
            return booking;
        }
        else
        {
            throw new UserInputError('User must be of type user');
        }
        },

        async createBookingByAdmin(_,{listing_id,listing_title,description,street,city,price,postalCode},context){
            const user = checkAuth(context);
            console.log(user);
            console.log('this is user',user);
            console.log('he',context)
            if(user.type == 'admin')
        {
            const newBooking = new Booking({
                listing_id,
                listing_title,
                description,
                street,
                city,
                price,
                postalCode,
                user: user.id,
                username: user.username,
                email: user.email,
                type: user.type,
            });
            const booking = await newBooking.save();
            return booking;
        }
        else
        {
            throw new UserInputError('User must be of type admin');
        }
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => ({req})
});

const url = "mongodb://nabokhusri:1234@cluster0-shard-00-00.mygrt.mongodb.net:27017,cluster0-shard-00-01.mygrt.mongodb.net:27017,cluster0-shard-00-02.mygrt.mongodb.net:27017/test?replicaSet=atlas-vieyud-shard-0&ssl=true&authSource=admin";
const connect = mongoose.connect(url, { useNewUrlParser: true });
connect.then((db) => {
      console.log('Connected correctly to server!');
}, (err) => {
      console.log(err);
});

server.listen({port:5000}).then((res)=>{
    console.log(`Server running at ${res.url}`);
})
