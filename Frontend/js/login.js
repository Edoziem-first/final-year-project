const loginForm =
document.getElementById(
"loginForm"
);

const message =
document.getElementById(
"message"
);


loginForm.addEventListener(

"submit",

async (e)=>{

e.preventDefault();


const email =

document
.getElementById(
"email"
)
.value;


const password =

document
.getElementById(
"password"
)
.value;


try{

const response =
await fetch(

"http://127.0.0.1:5050/api/auth/login",

{

method:"POST",

headers:{

"Content-Type":
"application/json"

},

body:
JSON.stringify({

email,
password

})

}

);


const result =
await response.json();


if(response.ok){

localStorage.setItem(

"token",

result.token

);

localStorage.setItem(

"user",

JSON.stringify(
result.user
)

);


message.style.color =
"green";

message.innerText =

"Login successful";


setTimeout(()=>{

const role =
result.user.role;


if(
role ===
"Cashier"
){

window.location.href =

"sales.html";

}


else if(

role ===
"Pump Attendant"

){

window.location.href =

"attendance.html";

}


else if(

role ===
"Driver"

){

window.location.href =

"deliveries.html";

}


else if(

role ===
"Depot Manager"

||

role ===
"Station Manager"

||

role ===
"Admin"

){

window.location.href =

"dashboard.html";

}


else{

window.location.href =

"dashboard.html";

}

},1000);

}


else{

message.style.color =
"red";

message.innerText =

result.error ||

"Invalid credentials";

}

}

catch(error){

console.error(
error
);

message.style.color =
"red";

message.innerText =

"Server error";

}

}

);