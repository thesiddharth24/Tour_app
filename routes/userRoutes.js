const express = require('express');
const userControllers = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();
const reviewController = require('./../controllers/reviewController');
const multer = require('multer');

const upload = multer({dest: 'public/img/users'});

router
  .route('/signup')
  .post(authController.signup);

  router
  .route('/login')
  .post(authController.login);



router
  .route('/forgotPassword')
  .post(authController.forgotPassword);

router.patch('/resetPassword/:token',authController.resetPassword);  

///middleware 
router.use(authController.protect);

router.get('/me',userControllers.getMe,userControllers.getUser);

router //work only for loged in user 
 .route('/updateMyPassword')
 .patch(authController.updatePassword);

router //work only for loged in user 
 .route('/updateMe')
 .patch(upload.single('photo'),userControllers.updateMe);

 router.delete('/deleteMe',userControllers.deleteMe); 


 //midddleware 
 router.use(authController.restrictTo('asmin'));

router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);

router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);


   

  
  // app.use('/api/v1/users',router);//its a mounting the router 

  module.exports=router;