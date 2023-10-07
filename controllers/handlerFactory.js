// const { Model } = require("mongoose");
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async(req,res,next)=>{
    
    const doc =  await Model.findByIdAndDelete(req.params.id);
     if (!doc){
         return next(new AppError('No doc found with this id ',404));
      }
     res.status(204).json({  //204->no content 
     status:"success",
     data:null
 });
});

exports.updateOne= Model => catchAsync(async(req,res,next)=> {

    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    if (!doc){
        return next(new AppError('No doc found with this ID ',404));
     }
   
    res.status(200).json({
        status:"success",
        data:{
            data:doc
        }
    });
});

exports.createOne= Model => catchAsync(async(req,res,next)=> {
     

    const newDoc= await Model.create(req.body);
    res.status(201).json({
        staus:"success",
        data:{
            data:newDoc
        }
    });

});    

exports.getOne = (Model, popOptions) => catchAsync(async (req,res,next)=>{
    
    let query = Model.findById(req.params.id);
    if(popOptions){
        query = query.populate(popOptions);
    }
    
    const doc = await query;


    // const doc =  await Model.findById(req.params.id).populate('reviews');
    // //Tour.findOne({_id:req.params.id})
    
    if (!doc){
       return next(new AppError('No document found with this ID',404));
    }
    
    res.status(200).json({
        status:'success',
        requestedat: req.requestTime,
        results:doc.length,
        data:{
            data:doc
        }
    });
});


exports.getAll = Model => catchAsync(async(req,res,next)=>{
//Execute the query

//to allow for nested get reviews on tour 
let filter = {};
    if(req.params.tourId)
    { filter ={
        tour:req.params.tourId
    }
    }



const features = new APIFeatures(Model.find(filter),req.query)
.filter()
.sort()
.limitFields()
.paginate();
//  const X = await query;
const doc = await features.query;
//query.sort().select().skip().limit() 
//its called chaining 

//send response 
res.status(200).json({
   status:'success',
   requestedat: req.requestTime,
   results:doc.length,
   data:{
       data:doc
   }
});
});







