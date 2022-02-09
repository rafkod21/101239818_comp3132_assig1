module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword,
    type
) =>{
    const errors = {};
    if(username.trim() === ''){
        errors.username = 'Username must not be empty'
    }
    if(email.trim() === ''){
        errors.email = 'email must not be empty'
    }
    else{
        const regEx =  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if(!email.match(regEx)){
            errors.email = "Email must be a valid email address"
        }
    }
    if(password === ''){
        errors.password = 'Username must not be empty'
    }
    else if( password !== confirmPassword){
        errors.confirmPassword = 'Passwords dont match'
    }
    if(type.trim() === ''){
        errors.type = 'type must not be empty'
    }
    else if (type === 'user' || type === 'admin')
  {

  }
  else
    {
        errors.type = 'type must be user or'
    }
  
    

    return {
        errors,
        valid: Object.keys(errors).length < 1
    }

};

