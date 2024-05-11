document.querySelector(".register").addEventListener("submit", function(event){
    event.preventDefault()
    let {login, password, repeat_password}= event.target
    console.log(login, password, repeat_password)
    if(password.value !== repeat_password.value){
        alertify.error("Passwords is not match")
        return;
    }
    let user = {
        login: login.value,
        password: password.value
    }
    let xhr = new XMLHttpRequest
    xhr.open("post", "/api/register")
    xhr.onload = ()=>{
        alertify.success("We are fucking stupid bitches")
    };
    xhr.send(JSON.stringify(user))
})