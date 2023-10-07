const express = require('express');
const router = express.Router({ mergeParams:true});

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//becoz of merge params 
//POST /tour/id_tour/reviews 
//POST /reviews 

router.use(authController.protect);

router
 .route('/')
 .get(reviewController.getAllReviews)
 .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview);


router
 .route('/:id')
 .delete(authController.restrictTo('admin','user'),reviewController.deleteReview)
 .patch(authController.restrictTo('admin','user'),reviewController.updateReview)
 .get(reviewController.getReview);
// router 
//   .route('/'); 


module.exports=router;