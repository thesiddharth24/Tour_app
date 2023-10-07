const express = require('express');
const tourcontrollers = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController=require('./../controllers/reviewController');
const reviewRoutes = require('./../routes/reviewRoutes');
///////////////////
const router = express.Router();//its  a middleware


// router.param('id',(req,res,next,val) => {
//     console.log(`Tour is is ${val}`);
//     next();
// })

////////////////////////////
// router.param('id',tourcontrollers.checkID);

//creatye check body 
// check if a body contains the name and price property 
//if not , then send back 400 (bad request )
//add it to the post handler stack

///alias 
router
.route('/top-5-cheap')
.get(tourcontrollers.aliasTopTours,tourcontrollers.getAllTours);//do with the help of middleware 

//Aggrigation pipeline 
router
.route('/tour-stats')
.get(tourcontrollers.getTourStats);

//Business problem 
router
.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),
     tourcontrollers.getMonthlyPlan);

//geo routes 
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourcontrollers.getToursWithin);   
  // / tours-distance?distance=233&center=-40,45&unit=mi
  // / tours-distance/233/center/-40,45/unit/mi

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourcontrollers.getDistances);  


router
.route('/')
.get(tourcontrollers.getAllTours)
//.post(tourcontrollers.checkBody, tourcontrollers.createTour);
.post(authController.protect,
  authController.restrictTo('admin','lead-guide'),
  tourcontrollers.createTour);
//router.get('/api/v1/tours',getAllTours);//to get all the tours   ---->> choose alternative method given below 
router.get('/:id',tourcontrollers.getTour); //get a perticular tour 


//now post request 
//router.post('/api/v1/tours',createTour);//create perticular tour 

router.patch('/:id',authController.protect,authController.restrictTo('admin','lead-guide'),tourcontrollers.upadteTour);

router.delete('/:id',authController.protect,authController.restrictTo('admin','lead-guide'),tourcontrollers.deleteTour);

  //nested routes 
   //go on user router
   //POST /tour/id_tour/reviews
   //GET /tour/id_tour/reviews
   //GET /tour/id_tour/reviews/reviewId

   //its bit massy 
//    router
//     .route('/:tourId/reviews')
//     .post(authController.protect,authController.restrictTo('user'),reviewController.createReview);
//try this 

//here we have done mounting the router 
router
 .use('/:tourId/reviews',
 reviewRoutes)


module.exports = router;