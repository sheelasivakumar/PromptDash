chrome.action.onClicked.addListener((tab) =>{
    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick : true});
})


chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    if(request.token){
        chrome.storage.local.set({'jwt':request.token},function(){
            if(chrome.runtime.lastError){
                console.error('Error storing JWT in bg');
                sendResponse({message:'Error storing token'});
            }
            else{
                console.log('JWT stored successfully in bg');
                sendResponse({message : 'Token received and stored'});
            }
        })
    }else if(request.logout){
        chrome.storage.local.remove('jwt',function(){
            if(chrome.runtime.lastError){
                console.error('Error clearing JWT in bg.js',chrome.runtime.lastError);
                sendResponse({message:'Error clearing token'});
            }
            else{
                console.log('JWT cleared successfully in bg.js');
                sendResponse({message:'Token cleared'});
            }
        })
    }
    return true;
})
