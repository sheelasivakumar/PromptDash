document.addEventListener('DOMContentLoaded',function(){
    const signin = document.getElementById("signin");
    
    chrome.storage.local.get('jwt',function(result){
        if(chrome.runtime.lastError){
            console.error('Error retrieving JWT:',chrome.runtime.lastError);
        }
        else{
            const storedJWT = result.jwt;
            if(storedJWT){
               console.log('Retrieved JWT: ', storedJWT);
               const signinpage = document.getElementById("signdiv");
               signinpage.style.display = "none";
               const content = document.getElementById("show");
               fetchuserinfo(storedJWT);
               content.style.display = "flex";
            }
            else{
                console.log("JWT not found in storage");
                if(signin){
                    signin.addEventListener('click',() =>{
                        chrome.identity.launchWebAuthFlow({
                            url: 'https://accounts.google.com/o/oauth2/auth'+'?response_type=code'+'&client_id=326565740815-jpcrthgav7a060eq2g26skiku05q2ufe.apps.googleusercontent.com'+'&redirect_uri=https://fapceojafboiiigebjjhjbdenhgihdkm.chromiumapp.org/popup.html'+'&scope=email%20profile',interactive:true
                        },
                        function(redirectUrl){
                            if(chrome.runtime.lastError || !redirectUrl){
                                console.error(chrome.runtime.lastError);
                                return;
                            }
                            console.log(redirectUrl)
                            const redirect_url ={
                                code : redirectUrl
                            } 
                            fetch("http://localhost:5000/authenticate",{
                                method:"POST",
                                headers:{
                                    'Content-Type' : 'application/json',
                                },
                                body: JSON.stringify(redirect_url),
                            }).then((response)=>{
                                if(response.ok){
                                    return response.json();
                                }
                                else{
                                    throw new Error('Failed to initiate OAuth2 Flow');
                                }
                            }).then((data)=>{
                                console.log(data)
                                const token = data.msg;
                                chrome.runtime.sendMessage({token:token}, function(response){
                                    if(response && response.message === 'Token received and stored'){
                                        console.log('Token sent and stored successfully in bg.js');
                                    }else{
                                        console.log('Error sending token to bg.js');
                                    }
                                })
            
                                chrome.runtime.onMessage.addListener(function(response){
                                    if(response && response.message === 'Token received and stored'){  
                                        console.log('Received Confirmation from bg.js');
                                    }
                                })
                                fetchuserinfo(token);
                            }).catch((error)=>{
                                console.log("Error Initiating OAuth2 Flow: ",error);
                            })
                        })
                    });
                }
            }
        }
    })


    
    const logout = document.getElementById("logout");
    logout.addEventListener('click',function(){
     if(logout){
         chrome.runtime.sendMessage({logout:true},function(response){
             if(response && response.message == 'Token cleared'){
                 console.log('Logout request sent and token cleared');
             }else{
                 console.error('Error sending logout request to bg.js',response);
             }
         })
        }
})
chrome.runtime.onMessage.addListener(function(response){
    if(response && response.message === 'Token cleared'){
        console.log('Received confirmation from bg.js');
        const logoutpage = document.getElementById("show");
        logoutpage.style.display = "none";
        const signinpage = document.getElementById("signindiv");
        signinpage.style.display = "block";
    }
})
})

function fetchuserinfo(token){
    fetch('http://localhost:5000/getinfo',{
        method : 'GET',
        headers : {
            'Authorization' : `Bearer ${token}`
        }
    }).then(response => response.json())
    .then((data)=> {
        console.log(data);
        const signin = document.getElementById("signdiv");
        signin.style.display = "none";
        const content = document.getElementById("show");
        content.style.display = "flex";
        const name = document.getElementById("name");
        const email = document.getElementById("email");
        name.textContent = data.payload["name"];
        const profile = document.getElementById("profileImg")
        profile.src=data.payload["profile"]
    })
    .catch((error)=>{
        console.error(error);
    })
}

