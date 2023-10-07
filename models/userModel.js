const crypto= require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell us your name !']
    },
    email:{
        type:String,
        required:[true,'Plese provide your email!'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },
    photo:String,
    role:{
       type:String,
       enum:['user','guide','lead-guide','admin'],
       default:'user' 
    },
    password:{
        type:String,
        required:[true,'Plese provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Plese confirm your password'],
        validate:{
            //the only work on create and  save !!
            validator:function(el){
                return el === this.password;//abc===abc
            },
            message:`Password are not the same`
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken:String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        //hide from output
        select:false
    }
    
});

//password encrytion
//////////////////////////
userSchema.pre('save',async function(next){
    //only run this fxn if a  password was only modified 
    if(!this.isModified('password'))return next();

   //encryt by bcryt algo 
   //hash the password with cost of 12
   this.password= await bcrypt.hash(this.password,12);

   //delete the password confirm field 
   this.passwordConfirm=undefined;
   next();
});

userSchema.pre('save',function (next){
     if(!this.isModified('password') || this.isNew)
     {
        return next();
     }
    
    this.passwordChangedAt = Date.now() - 1000;
    next();

});

////////////////////////////////

//1
userSchema.pre(/^find/,function(next){
   //this points to the current query 
   //now we will apply a fliter object 
   this.find({active: { $ne:false}});

   next();
});

userSchema.methods.correctPassword =async  function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
       const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);  //base 10 

        // console.log(this.passwordChangedAt,JWTTimestamp);
        return JWTTimestamp < changedTimestamp;//100<200
    }

    //false means not changed 
    return false;
}


userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');


    console.log({resetToken},this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports=User;
 