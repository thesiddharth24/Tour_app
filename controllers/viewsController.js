const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError=require('./../utils/appError');


exports.getOverview = catchAsync(async(req,res)=>{
    //1> get tour data
     const tours=await Tour.find();
    //2> built template 


    //3> render that template using tour data from 1 


    res.status(200).render('overview',{
        title:'All Tours',
        tours
    });
});

exports.getTour=catchAsync(async(req,res,next)=>{
    //1> get data for the requested tour including reviews and guides
     const tour = await Tour.findOne({slug:req.params.slug}).populate({
        path: 'reviews',
        fields:'review rating user'
     });

    //2> built template 
    //3> render that template using tour data from 1 


    res.status(200).render('tour',{
        title:`${tour.name} tour`,
        tour
    });
});

exports.getLoginForm = catchAsync(async(req,res)=>{
     res.status(200).render('login',{
        title:`Log into your account`
     });
});