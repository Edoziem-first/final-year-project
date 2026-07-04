const form =
document.getElementById(
"forgotPasswordForm"
);

const message =
document.getElementById(
"message"
);


form.addEventListener(

"submit",

async (e)=>{

e.preventDefault();

const email =

document
.getElementById(
"email"
)
.value;


try{

const response =
await fetch(

"http://127.0.0.1:5050/api/auth/forgot-password",

{

method:"POST",

headers:{

"Content-Type":
"application/json"

},

body:
JSON.stringify({

email

})

}

);


const data =
await response.json();


if(response.ok){

message.style.color =
"green";

message.innerText =
data.message;


setTimeout(()=>{

window.location.href =

"./pages/login.html";

},2500);

}

else{

message.style.color =
"red";

message.innerText =
data.error ||
"Failed";

}

}

catch(error){

console.error(error);

message.style.color =
"red";

message.innerText =

"Server error";

}

}

);