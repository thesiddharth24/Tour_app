const path = require('path');
const express = require('express');
const morgan = require('morgan');

//security
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const viewRouter=require('./routes/viewRoutes');






const app = express();

app.set('view engine','pug');
//pug is the templet engine 
app.set('views',path.join(__dirname,'views'));



console.log(process.env.NODE_ENV);
//1-->>>GLOBAL  Middlewares
//sereving static file 
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,'public')));

//helmet 
//set sequrity HTTP headers
app.use(helmet());

//development logging 
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); //give info about the request in terminal 
}
//Limit request from same IP
const limiter = rateLimit({
   max:100,
   windowMs: 60 * 60 * 1000,//100 req from same ip in 1 hr 
   //if they this limit wxeeded thwy will get error message 
   message: `To mny request from this IP, Please try again in an hr !!`
   //429 for tooo many request 
});

app.use('/api',limiter);

//Body parser , reading data from body into req.body 
app.use(express.json({ limit:'10kb'}));//its a middleware //it parses the data from body 
app.use(cookieParser());//it parses the data from cookie 

//Data sanitization against NOSQL query injection 
//remove all the $ sign from the string 
//login hack if you know then you know 
app.use(mongoSanitize());


//Data sanitization against XSS
app.use(xss());

//prevent parameter pollution 
//socho 
//duration=5&duration=9
// app.use(hpp());
app.use(hpp({
    whitelist:[
       'duration',
       'ratingsQuantity',
       'ratingsAverage',   
       'maxGroupSize',
       'difficulty', 
       'price'
    ]
}));




//CREATE OUUR OWN MIDDLEWARE 
// app.use((req,res,next)=>{
//     console.log(`Hello from the middleware `);
//     next();
// });
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
   // console.log(`Hello from the middleware `);
  // console.log(req.headers);
//   console.log(req.cookies);
    next();
});

// app.get('/',(request,response)=>{
//     // response.status(200).send(`hello from the server side`);
//     response
//      .status(200).json
//     ({message:`hello from the server side`,
// app:'Norotus' });
// });

// app.post('/',(req,res) => {
//   res.send('You can post thi send point ');
// }); 
//////////////////////////////////////////////////////////////////

/////////////////////////



////////////////////////
//3-->> all routs



app.use('/',viewRouter);//its a mounting the router 
app.use('/api/v1/users',userRouter);//its a mounting the router 
app.use('/api/v1/tours',tourRouter);//its a mounting the router
app.use('/api/v1/reviews',reviewRouter);//its a mounting the router

app.all('*',(req,res,next) =>{
    // res.status(404).json({
    //     status:`fail`,
    //     message:`Can't find ${req.originalUrl} on the serevr`
    // });
    //////////////////
    // const err = new Error(`Can't find ${req.originalUrl} on the serevr`);
    // err.status = 'fail';
    // err.statusCode = 404;
    
    //whenever we pass anything into this next that is error 
    //this will bypass all middleware in the stack and go directly into the global err middleware handler 
    // next(err);

    //////////////////

    next(new AppError(`Can't find ${req.originalUrl} on the serevr`));
});

// //error handling middleware 
// app.use((err,req,res,next)=>{
    
//     console.log(err.stack);

//     err.statusCode =err.statusCode || 500;
//     //500 means internal server err
//     err.status=err.status|| 'error';
//     res.status(err.statusCode).json({
//         status:err.status,
//         message:err.message
//     });
// });//exported to error controller 

app.use(globalErrorHandler);


module.exports=app; 

