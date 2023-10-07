const mongoose = require('mongoose');
const slugify= require('slugify');
const validator=require('validator');
// const User=require('./userModel'); for refrancing we dont need this 


const tourSchema =new  mongoose.Schema({
    name:{
        type:String,
        required:[true,`A tour must have the name`],
        unique:true,
        trim:true,
        maxlength:[40,`A tour name mush less or equal 40 char`],
        minlength:[10,`A tour name mush more or equal 10 char`]
        //validate:[validator.isAlpha,`Tour name must only contain character`]
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,`A tour must have the duration`]
    },
    maxGroupSize:{
        type:Number,
        required:[true,`A tour must have the group size`]
    },
    difficulty:{
        type:String,
        required:[true,`A tour must have a difficulty`],
        enum:{
            values:['easy','medium','difficult'], 
            message: 'Invalid difficulty'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,`Rating must be above 1.0`],
        max:[5,`Rating must be below 5`],
        set: val => Math.round(val * 10) / 10 // 4.66666 -> 4.7 so 4.6666 * 10 = 46.6666 -> 47/10 = 4.7;
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,`A tour must have the price`]
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(value){
                //this only points to current document on new document creation 
                //it dosent work with updation 
                return value < this.price;
            },
            message:'your discount is higher than the actual price'
            
            
        }    
    },
    summary:{
        type:String, 
        trim:true,
        required:[true,`A tour must have the description`]
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,`A tour must have the cover image`]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false //this will hide this column from the client 
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        //GeoJSON
        type:{
             type:String,
             default:'Point',
             enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
           },
           coordinates:[Number],
           address:String,
           description:String,
           day:Number
        }
    ],
    // guides:Array
    //////now we will do refrencing 
    guides:[
        {
        type:mongoose.Schema.ObjectId,
        ref:'User'
        }
    ]
    // reviews:[
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
    //insted we are gonna use virtual populate 

},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
});


// tourSchema.index({price:1});//1 for asscending order 
//compound index
tourSchema.index({price:1  ,  ratingsAverage:-1});//1 for asscending order 
tourSchema.index({slug:1});//1 for asscending order 
tourSchema.index({ startLocation: '2dsphere'});

//virtual properties
//it does not take space in the memory 
//we cant apply query on the virtual property because it is not present in the database 

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7 ;
    //this here pointing to the current document
});

tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField:'tour',
    localField:'_id'
});

//Documrnt middleware RUNS BEFORE .SAVE() AND BEFORE  .CREATE()

tourSchema.pre('save',function(next){
    //console.log(this);
    this.slug = slugify(this.name,{ lower:true });
    next();
});

//embeded fxn 
// tourSchema.pre('save', async function(next) {
//    const guidesPromises = this.guides.map(async id => await User.findById(id));
//    this.guides=await Promise.all(guidesPromises);

//    next();
// });

//refrancing 

//here this points to the current document which we have currently saved 

// tourSchema.pre('save',function(next){
//     //console.log(this);
//     console.log(`we will save the document`);
//     next();
// });
// //here save is the hook
// tourSchema.post('save',function(doc,next){
//     console.log(doc)
//     next();
// })

//query middleware 
tourSchema.pre(/^find/,function(next){
    this.find({
        secretTour:{
            $ne:true
        }
    });
    this.start = Date.now();
    next();
});//for all the query which is start with find 

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    });
    next();
});


//post have docs that query have returned 
tourSchema.post(/^find/,function(docs,next){ 
    console.log(docs);
    console.log(`Query took ${Date.now() - this.start} millseconds`);
    next();
});








// tourSchema.pre('findOne',function(next){
//     this.find({
//         secretTour:{
//             $ne:true
//         }
//     })
//     next();
// });


/////////////////////////////////
//Aggregation middleware 
//secret tour hatao aggregate middleware se 
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({
//         $match:{
//             secretTour:{
//                 $ne:true
//             }
//         }
//     })

//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour',tourSchema);  //here Tour is like a class wih the use of schema

module.exports = Tour;