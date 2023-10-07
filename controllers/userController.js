const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');


//////
const filterObj=(obj,...allowedFields)=>{
    const newObj={};
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)){
        newObj[el]=obj[el];
    }
  });

  return newObj;
}

exports.getMe =(req,res,next)=>{
    req.params.id=req.user.id;
    next();
};

/////
//we are facing error here 
// exports.getAllUsers=catchAsync(async(req,res,next)=>{
//     const users = await User.find();
//     //query.sort().select().skip().limit() 
//     //its called chaining 

//    //send response 
//    res.status(200).json({
//        status:'success',
//        requestedat: req.requestTime,
//        results:users.length,
//        data:{
//            tours:users
//        }
//    });
// });

exports.getAllUsers = factory.getAll(User);



// exports.getAllUsers = (req,res) =>{
//     res.status(500).json({
//         status:'error',
//         message:'This route is not yet defined!!'
//     })
// };

//////////////////////
//update the data 
exports.updateMe = catchAsync(async(req,res,next)=>{



    console.log(req.file);
    console.log(req.body);

   //1> create error if user POSTs password data
        if(req.body.password || req.body.passwordConfirm){
            return next(new AppError(`This route is not used for password update . this is for data update !!`,400));
            //400 for bad request 

        }   
   //2>Update user documnet
   //filtered out unwanted body 
   const filteredBody = filterObj(req.body,'name','email');
   const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
    runValidators:true
   })
   res.status(200).json({
    status:'success',
   user: updatedUser
   })
});

//diabeling the active button 
exports.deleteMe = catchAsync(async(req,res,next)=>{
    

   await User.findByIdAndUpdate(req.user.id,{ active: false});

   res.status(204).json({
    status:'success',
   data:null
   })
});

exports.getUser = factory.getOne(User);

exports.createUser = (req,res) =>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined!! , Please use signUP for this !!'
    })
};


//Do not update password with this 
exports.updateUser = factory.updateOne(User);


exports.deleteUser = factory.deleteOne(User);