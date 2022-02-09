const { gql } = require('apollo-server-express');
const Booking = require('./models/booking').Bookings

const typeDefs = gql `
   type Booking {
     id: ID!
     listing_title: String!
     description: String!
     street: String!
     city: String!
   }
   type Query {
     getBookings: [Booking]
     getBooking(id: ID!): Booking
   }
   type Mutation {
     addBooking(listing_title: String!, description: String!, street: String!, city: String!): Booking
 
   }
`

const resolvers = {
    Query: {
      getBookings: (parent, args) => {
        return Booking.find({});
      },
      getBooking: (parent, args) => {
        return Booking.findById(args.id);
      }
    },
    Mutation: {
      addBooking: (parent, args) => {
        let booking = new Booking({
          listing_title: args.listing_title,
          description: args.description,
          street: args.street,
          city: args.city
        });
        return booking.save();
      },
     
    }
  }

  module.exports = {typeDefs,resolvers}