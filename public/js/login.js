// /* eslint-disable*/


// // exports.login =async(email,password) =>{
// //     console.log(email,password);
//     // try{
        
//     //     const res = await axios({
//     //         method:'POST',
//     //         url:'http://127.0.0.1:3000/api/v1/users/login',
//     //         data: {
//     //             email,
//     //             password
    
//     //         }
//     //     });
//     //     console.log(res);
  
//     // }catch(err){
//     //        console.log(err);
//     // }
   
        
//             // try{
//             //     const res = await axios({
//             //         method:'POST',
//             //         url: 'http://127.0.0.1:3000/api/v1/users/login',
//             //         data:{
//             //             email,
//             //             password
//             //         }
//             //     });
//             //     console.log(res.data.status);
//             //     if(res.data.status === 'success'){
//             //         alert('logged in succesfully !!');
//             //     }
//             //     // console.log(res);
//             // }catch(err){
//             //     console.log(err.response.data);
//             // }
//             // console.log("this here is login function being called");
//             // try{
//             //     const res = await axios({
//             //         method:"POST",
//             //         url: "http://127.0.0.1:8000/api/v1/users/login",
//             //         data:{
//             //             email,
//             //             password
//             //         }
//             //     });
//             //     console.log("this is the res : ",res.data);
//             // }catch(err){
//             //     console.log(err);
//             // }
//              const login = async (email, password) => {
//                 try {
//                   const response = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
//                     method: 'POST',
//                     headers: {
//                       'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                       email,
//                       password,
//                     }),
//                   });
              
//                   if (!response.ok) {
//                     const error = await response.json();
//                     throw new Error(JSON.stringify(error.message));
//                   }
              
//                   const data = await response.json();
              
//                   if (data.status === 'success') {
//                     showAlert('success', 'Logged in Successfully');
//                     window.setTimeout(() => {
//                       location.assign('/');
//                     }, 1500);
//                   }
//                 } catch (err) {
//                   // console.log(err);
//                   showAlert('error', err.message);
//                 }
//               };
              
// // };
           
      



// document.querySelector('.form').addEventListener('submit',e=>{
//     e.preventDefault();
//     //reading from html
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

// login(email,password);

// });  