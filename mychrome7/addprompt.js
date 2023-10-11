const title = document.getElementById("prompt_title")
const prompt1 = document.getElementById("prompt")
const category = document.getElementById("category")
const save = document.getElementById("addprompt")
const clearinput = document.getElementById("clearall")


clearinput.addEventListener("click",()=>{
    prompt1.value = '';
})

var storedJWT;

chrome.storage.local.get('jwt',function(result){
    if(chrome.runtime.lastError){
        console.error('Error retrieving JWT:',chrome.runtime.lastError);
    }
    else{
        storedJWT = result.jwt;
        if(storedJWT){
           console.log('Retrieved JWT: ', storedJWT);
        }
        else{
            console.log("error");
        }
    }
})


save.addEventListener('click',function(){
    const prompts = prompt1.value;
    const title1 = title.value;
    const category1 = category.value;
    if (!prompts || !title1 || category1=="none") {
        setMessage('Please fill in all fields');
        return;
    }
    console.log(prompts,title1,category1);
    const data = {"prompt":prompts,"title" : title1,"category" : category1}
    console.log(data)
    fetch("http://localhost:5000/add",{
        method: "POST",
        headers : {
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json()).then((data)=>{
        console.log(data);
        setMessage("Prompt Added");
    }
    )
    .catch((error)=>{
        console.error(error);
    })
})

function setMessage(message) {
    const messageElement = document.getElementById('successMessage');
    messageElement.classList.add('success-message');
    messageElement.textContent = message;
    setTimeout(() => {
        messageElement.classList.remove('success-message');
        messageElement.textContent = '';
    }, 1000);

}