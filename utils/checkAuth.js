const jwt = require('jsonwebtoken');
const { AuthenticationError} = require('apollo-server');
const SECRET = "HEHEHE"

module.exports = (context) => {
    //context == {...headers}
    let oop = 1232;
    const authHeader = context.req.headers.authorization;
    if(authHeader){
        // Bearer ...
        const token = authHeader.split('Bearer ')[1];
        if(token){
            try{
                const user = jwt.verify(token, SECRET);
                return user;
            }
            catch(err){
                throw new AuthenticationError('Invalid/Expired Token');
                console.log('hehe')
            }
        }
        throw new Error('Authnetication token must be Bearer token',context)
        console.log('hehe')

    }
    throw new Error(`Authnetication header must be provided.`,)
    console.log('hehe')
}