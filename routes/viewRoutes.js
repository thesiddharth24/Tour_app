const express=require('express');

const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.get('/',(req,res)=>{
//     res.status(200).render('base',{
//         tour:'The forest hiker',
//         user:'siddharth'
//     });
// });//this is just a test

////////////
// router.use(authController.isLoggedIn);


router.get('/',viewsController.getOverview);

router.get('/tour/:slug',viewsController.getTour);


router.get('/login',viewsController.getLoginForm);

module.exports = router;