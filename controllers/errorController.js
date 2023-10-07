const AppError = require("../utils/appError");

const handleJWTError = err =>{
    const message = `Invalid token plese login with valid token`;
    return new AppError(message,401);//401 for unauthrise
}

const handleJWTExpiredError = err =>{
    const message = `Your token has been expired please login again ! `;
    return new AppError(message,401);//401 for unauthrise
}

const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}:${err.value}.`;
    return new AppError(message,400);
}
//bug
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
  
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  };
  const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  };


const errForDev=(err,response)=>{
    response.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    });
};
const errForProduction =(err,response)=>{
    // Operational, trusted error: send message to client
    if(err.isOperational){
        response.status(err.statusCode).json({
            status:err.status,
            
            message:err.message
    
    });// Programming or other unknown error: don't leak error details
    }else{
        //log err
        console.error('ERROR 💥', err);
        //2> send generic message 
        response.status(500).json({
            status:'error',
            message:`something went very wrong!!`
        })
    }
   
}





//error handling middleware 
module.exports = ((err,req,res,next)=>{
    
    //console.log(err.stack);

    err.statusCode =err.statusCode || 500;
    //500 means internal server err
    err.status=err.status|| 'error';
    if(process.env.NODE_ENV==='development'){
        errForDev(err,res);
    }else if(process.env.NODE_ENV ==='production'){
        let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if(err.name === 'JsonWebTokenError'){
        error = handleJWTError(error);
    }


    if(err.name === 'TokenExpiredError'){
        error = handleJWTExpiredError(error);
    }


         errForProduction(error,res);
            
   
    }
   
});