
const fs=require('fs')
const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config({path:'./config.env'});
const Tour=require('./../../models/tourModel')
const Review=require('./../../models/reviewModel');
const User=require('./../../models/userModel');



// console.log(app.get('env'))
// console.log(process.env)
//4>.. strater server
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false //this method is gonna return a promise
}).then(con =>{
     // console.log(con.connections);
    console.log(`DB Connection succesful`);
});

//Reading json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

//import data into db
const importData = async ()=>{
    try{
        await Tour.create(tours);
        await User.create(users,{ validateBeforeSave: false});
        await Review.create(reviews);
        console.log(`Data sussesfully loaded`);
        
    }catch(err){
        console.log(err);
    }
    process.exit();
}

// Delete all data from collection
const deleteData = async()=>{
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany(); //it will delete all of document in certain collection 
        console.log('Data deleted succesfully!');
        

    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === `--import`){
    importData();
}else if (process.argv[2] === `--delete`){
    deleteData();
}

// console.log(process.argv);


