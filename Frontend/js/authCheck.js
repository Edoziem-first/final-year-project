const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    window.location.href = "../pages/login.html";
}