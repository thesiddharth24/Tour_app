class APIFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    //req.query=queryStr

    filter(){
    /////////////////////////////////////
    //  const X = await Tour.find()
    //  .where('duration')
    //  .equals(5)
    //  .where('difficulty')
    //  .equals('easy');
     ///////////////////////////////////
    //  const X = await Tour.find({
    //     duration:5,
    //     difficulty:'easy'
    // });
    //////////////////////////////////
    //built a query
    //Filtering 
    const queryObj = {...this.queryStr};
    const excludedFields =['page','sort','limit','fields'];
    
    

    excludedFields.forEach(el=>delete queryObj[el]);
    // console.log(req.query,queryObj);
    // {
    //     { duration: '5', difficulty: 'easy', sort: '1' } { duration: '5', difficulty: 'easy' }
    // }
    ////////////////////////////
    //2>Advance filtering 
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match =>`$${match}`);
    // console.log(JSON.parse(queryStr));
    // //{ duration: '5', difficulty: {gte:'easy'} }{
    //     127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&sort=1
    // }
    //yeahi mila hai req.query me 
    //{ duration: { gte: '5' }, difficulty: 'easy', sort: '1' }
    // const query = Tour.find(queryObj);
      this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr));
     //console.log(req.query);
    ////////////////////////////////
    return this;
    }

    sort(){
        if(this.queryStr.sort){
            //sort the result
            const sortBy = this.queryStr.sort.split(',').join(' ');
            // console.log(sortBy)
            this.query= this.query.sort(sortBy);
           //query= query.sort(req.query.sort);
           //sort('price ratingsAverage')
           //127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&sort=price,ratingsAverage
           //replce , with space 
        }else{
            this.query= this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields(){
         //3> field limiting 
         if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            //    query=query.select('name duration price');
            //selecting certain fields name is called projecting
            this.query=this.query.select(fields);
            //-name means we are excluding the field 

        }else{
            this.query=this.query.select('-__v');
        }
        //NOTE-> here in this either we take all +ve or all -ve fields 
        //ya toh ham include ka fxn laga skte ya exclude ka fxn laga skte 
        ///////////////////////////////////////////
        /////////////////
        return this;
    }

    paginate(){
        //4-> pagenation 
        //* 1 convert string into int 
        const page = this.queryStr.page * 1 || 1; //we use || for default value
        const limit = this.queryStr.limit * 1 || 100;
        const skip = (page - 1) * limit;
        //page=2&limit10 , 1-10 -> page 1 ,11-20 -> page 2, 21-30 ->page 3
        //if we demand page 3 then we have to skip 20 result so query will be -! 
        //query = query.skip(20).limit(10);
        //    query = query.skip(10).limit(10);
    

       this.query = this.query.skip(skip).limit(limit);
   
    //    if(this.queryStr.page){
    //       const numTours = await Tour.countDocuments();
    //       if(skip >= numTours ){
    //         throw new Error('This page does not exit');
    //        //here we find an error in code look into this 
    //       }
    //     }
        return this;
    }
}

module.exports = APIFeatures;