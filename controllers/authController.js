const crypto = require('crypto');

const { promisify } = require('util');


const User = require('./../models/userModel');

const jwt=require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const { application } = require('express');
const sendEmail=require('./../utils/email')

const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET ,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user,statusCode,res)=>{
    const token= signToken(user._id);
    
    const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            
            httpOnly:true
     
    };

    if(process.env.NODE_ENV=== 'production'){
        cookieOptions.secure=true;
    }
    
    res.cookie('jwt',token, cookieOptions);
    //remove the password from th o/p
    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    });
    //send jwt via cookie
};


exports.signup =catchAsync( async (req,res,next)=>{
    
    const newUser =await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        passwordResetToken:req.body.passwordResetToken,
        passwordResetExpires:req.body.passwordResetExpires,
        active:req.body.active

    });

    // const token = jwt.sign({id:newUser._id}, process.env.JWT_SECRET ,{
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // });
    // const token = signToken(newUser._id);

    // res.status(201).json({
    //     status:"success",
    //     token,
    //     data:{
    //         user:newUser
    //     }
    // })

    createSendToken(newUser,201,res);
});

exports.login =catchAsync( async(req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    //1> checl if email and password 
     if(!email || !password){
       return  next(new AppError('Plese provide email and password!!',400))
     }

    //2> check if user exist 
    const user =await  User.findOne({email}).select('+password');
    console.log(user);
    //const correct =await user.correctPassword(password,user.password);
    console.log(user.password);
    let x = await user.correctPassword(password,user.password);
    console.log(x);
     if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or Password !!',401));
     }

    //3> if everything OK,send tokrn to the client 
    createSendToken(user,200,res);
    // const token= signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token
    // })
});


exports.protect = catchAsync(async(req,res,next) =>{
    let token;
    //1. Getting token and check if its there 
     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token = req.headers.authorization.split(' ')[1];
     }//this token we send with the web request
     else if(req.cookies.jwt) {
        token = req.cookies.jwt;
     }

     if(!token){
        return next(`you are not logged in! Plese log in to get access.`,401);
     }
    //2> varification token 
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    // console.log(decoded);
    //3> check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user belong to token belog to this user does no longer exists!!'),401)
    }

    //4>check if the user changed password after the token was issued 
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently has changed the password ! please login again',401))
    };
    

    //grant access to protected route 
    req.user = freshUser;
    next();
});

//Only for rendered pages
exports.isLoggedIn = catchAsync(async(req,res,next) =>{
   
     if(req.cookies.jwt) {
   
    //2> varification token 
    const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET)
    // console.log(decoded);
    //3> check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next();
    }

    //4>check if the user changed password after the token was issued 
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next();
    };
    

    //There is a loggedin user 
    //make user accessinle to templet 
    res.locals.user = freshUser;
   
     return next();
}
next();
});


exports.restrictTo = (... roles)=>{
    return (req,res,next) =>{
        //roles is an array 
        //roles ['admin','lead-guide'].role='user'
        if(!roles.includes(req.user.role)){
            return next(new AppError(`You do not have permission to acces !!`,403));//403 mean sforbidden 
        }

        next();
    }
}


///
exports.forgotPassword = catchAsync(async(req,res,next) =>{
   //1> get user based on posted email 
   const user = await User.findOne({
    email:req.body.email
   })

   
   if(!user){
    return next(new AppError('There is no user with this email address !!',404))
   }

   //2> generate a random reset token 
   //go to usermoadal for fxn 
   const resetToken = user.createPasswordResetToken();
   await user.save({validateBeforeSave : false});

   //3>> send it to user email 
   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

   const message = `Forgot your password ?? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n if you didnt forget your password please ignore this email!!`;

   //send email
   try{
       await sendEmail({
        email:user.email,
        subject:`Your password reset token (valid for 10 min) !!`,
        message
       })
   
   
       res.status(200).json({
         status:'success',
         message:'Token sent to email'
       })
   }catch(err){
      user.passwordResetToken=undefined
      user.passwordResetExpires=undefined
      await user.save({validateBeforeSave : false});

      return next(new AppError(`There was an err please try again after some time!! `),500);
   }


  

  
});

exports.resetPassword =catchAsync( async(req,res,next) =>{
 //1> get user based on token 
 const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');


 const user = await User.findOne({
    passwordResetToken:hashedToken,
    passwordResetExpires:{$gt:Date.now()}
 });
 
 //2> if token has not expired, there is a user , set the new password 
   if(!user){
    return next(new AppError('Token is invalid or has expired !!',400));
   }

   user.password=req.body.password;
   user.passwordConfirm=req.body.passwordConfirm;
   user.passwordResetToken=undefined;
   user.passwordResetExpires=undefined;

   await user.save();
 //3> update changed passwordat property for the current user 
   
 //4> Log the user in , send JWT token to the client 
 createSendToken(user,200,res);
//  const token= signToken(user._id);
//     res.status(200).json({
//         status:'success',
//         token
//     })
});
/////////////////////////////////
//update password
exports.updatePassword =catchAsync( async(req,res,next)=>{
    //1> Get user from collection 
     const user = await User.findById(req.user.id).select('+password');

    //2> check if the POSTed password is correct 
      if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError(`Your current password is wrong.`,401));
        //401 for bad request 
      }

    //3> update the password 
      user.password=req.body.password;
      user.passwordConfirm=req.body.passwordConfirm;
      await user.save();

    //4>log the userin , send JWT
    createSendToken(user,200,res);
    // const token= signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token
    // })

});