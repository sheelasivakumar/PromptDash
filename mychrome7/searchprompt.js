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

const usericon = document.querySelector(".icon");
const logoutdiv = document.querySelector(".logoutul");

usericon.addEventListener("click",function(){
    if(logoutdiv.style.display === "flex"){
        logoutdiv.style.display = "none";
    }
    else{
        logoutdiv.style.display = "flex";
    }
})


const category = document.querySelector(".option");
const ul = document.querySelector(".ul");
const catSelected = document.getElementById("selectedCat");
var selectedValue = "All";

category.addEventListener("click",function(){
    if(ul.style.display === "block"){
        ul.style.display = "none";
    }
    else{
        ul.style.display = "block";
    }
});

var lis = document.querySelectorAll(".ul li")

for(var i = 0; i<lis.length;i++){
    (function(){
        var value = lis[i].innerHTML;
        lis[i].addEventListener("click",function(){
            selectedValue = value;
            catSelected.innerHTML = value;
            console.log(selectedValue);
            ul.style.display = "none";
        });
    })();
}


const searchinput = document.getElementById("searchprompt");
const modeCheck = document.getElementById("private");
var mode;
var promptquery;
const searchBtn = document.getElementById("searchbtn");
const displayResult = document.getElementById("output");
const starting = document.getElementById("starting");
searchinput.addEventListener("keydown",function(event){
    if(event.keyCode === 13){
        event.preventDefault();
        performSearch();
    }
})

searchBtn.addEventListener("click",function(){
    performSearch();
})

const pinned = document.getElementById("pinnedprompt")
const pinPageBtn = document.getElementById("pinPageBtn")
const resultPageBtn = document.getElementById("resultPageBtn")

pinPageBtn.addEventListener('click',function(){

    document.getElementById("displayResult").style.display = "none";
    resultPageBtn.style.backgroundColor = "#2B2B2B";
    pinPageBtn.style.backgroundColor = "black";
    pinPageBtn.style.border = " border: 1px solid #3d3d3d";
    pinned.style.display = "flex";
    pinned.style.backgroundColor = "black";
    fetch("http://localhost:5000/displaypin",{
        method:"GET",
        headers:{
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
    }).then((response) => {
        if (response.status === 404) {
            throw new Error('No data Found');
        }
        return response.json();
    }).then((msg) => {
        console.log(msg);
        const itemsPerPage = 2;
        const items = msg;
        console.log(items)
        const itemsList = document.getElementById("pinnedprompt")
        const pageButtonsDiv = document.getElementById("pinned_pagination")
        const searchPagination = document.getElementById("search_pagination")
        pageButtonsDiv.style.display = "flex";
        searchPagination.style.display = "none";
        const prevBtn = document.getElementById("pinned-prev-btn");
        const nextBtn = document.getElementById("pinned-next-btn");
        let currentPage = 1;

function displayItems(pageNumber){
    itemsList.innerHTML = "";

    const startIndex = (pageNumber - 1)* itemsPerPage;
    const endIndex = startIndex+itemsPerPage;
    const itemsToDisplay = items.slice(startIndex, endIndex);


    itemsToDisplay.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "one";

        const truncatedPrompt = item.prompt.length > 50 ? item.prompt.slice(0, 50) + "..." : item.prompt;
        
        itemDiv.innerHTML = `
        <div class="title">
            <p>${item.title}</p>
            <div class="btns">
                <button class="disp copy-button"><i class="fas fa-copy"></i></button>
                <button class="disp unpin-button"><span><i class="fas fa-thumbtack" id="pin" style="margin-left:-1px"></i><i class="fas fa-slash" id="slash"></i></span></button>
                <button class="disp edit-button"><i class="fas fa-edit"></i></button>
                ${item.public ? '' : '<button class="disp del-button"><i class="fas fa-trash-alt"></i></button>'}
            </div>
        </div>
        <div class="prompt_category">${item.category}</div>
        <div class="prompt" title="${item.prompt}">${truncatedPrompt}</div>
        `;

        
        const copyBtn = itemDiv.querySelector(".copy-button");
        copyBtn.addEventListener('click',()=>{
            const promptId = item.prompt;
            console.log(promptId);
            copyPrompt(promptId)
        })

        const editBtn = itemDiv.querySelector(".edit-button");
        editBtn.addEventListener('click',function(){
            const promptId = item.prompt;
            const editPopup = document.getElementById("edit-text")
            editPopup.style.display = "block";
            const editText = document.getElementById("editTextInput");
            editText.innerHTML = promptId;
            const editChange = document.getElementById("editchange");
            const editCancel = document.getElementById("editCancel");
            editChange.addEventListener("click",function(){
                const editedPrompt = editText.value;
                console.log(editedPrompt);
                editPrompt(promptId,editedPrompt,storedJWT);
                editPopup.style.display = "none";
            })
            editCancel.addEventListener("click",function(){
                editPopup.style.display = "none";
            })
        })

        const delBtn = itemDiv.querySelector(".del-button");
        delBtn.addEventListener('click',function(){
            const promptId = item.prompt;
            deletePrompt(promptId,storedJWT);
            itemDiv.remove();
            const indexToRemove = items.findIndex(item => item.prompt === promptId);
            if (indexToRemove != -1) {
                items.splice(indexToRemove, 1);
            }
            displayItems(currentPage);
            updatePaginationButtons();
        })

        const unpinBtn = itemDiv.querySelector(".unpin-button");
        if(unpinBtn){
            unpinBtn.addEventListener('click',function(){
                const promptId = item.prompt;
                unpinPrompt(promptId,storedJWT);
                item.isPinned = false;
                itemDiv.remove();
                const indexToRemove = items.findIndex(item => item.prompt === promptId);
                if (indexToRemove != -1) {
                    items.splice(indexToRemove, 1);
                }
                displayItems(currentPage);
                })
            }
            itemsList.appendChild(itemDiv);
        });
        currentPage = pageNumber;
        updatePaginationButtons();
    }

        function createPaginationButtons(){
            const totalPages = Math.ceil(items.length / itemsPerPage);

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement("button");
                button.textContent = i;
                button.addEventListener("click", () => displayItems(i));
                paginationDiv.appendChild(button);
            }
        }


        function updatePaginationButtons(){
            const totalPages = Math.ceil(items.length / itemsPerPage);

            if(currentPage === 1){
                prevBtn.disabled = true;
                prevBtn.style.display = "none";
            }else{
                prevBtn.disabled = false;
                prevBtn.style.display = "block";
            }

            if(currentPage === totalPages){
                nextBtn.disabled = true;
                nextBtn.style.display = "none";
            }
            else{
                nextBtn.disabled = false;
                nextBtn.style.display = "block";
            }

            document.querySelectorAll("#pinned-page-buttons button").forEach((btn) => {
                btn.classList.remove("active");
            });
            document.querySelector(`#pinned-page-buttons button:nth-child(${currentPage})`).classList.add("active");
        }


        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                displayItems(currentPage - 1);
            }
        });

        nextBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(items.length / itemsPerPage);
            if (currentPage < totalPages) {
                displayItems(currentPage + 1);
            }
        });
        displayItems(currentPage);
        createPaginationButtons();
        updatePaginationButtons();
    }).catch((error)=> {
        if (error.message === 'No data Found') {
            console.log('No data Found'); 
            setMessage("No results Found!",success)
        } else {
            console.error(error); 
        }
    })

})

resultPageBtn.addEventListener('click',function(){
    document.getElementById("displayResult").style.display = "flex";
    document.getElementById("displayResult").style.backgroundColor = "black";
    resultPageBtn.style.backgroundColor = "black";
    pinPageBtn.style.backgroundColor = "#2B2B2B";
    pinned.style.display = "none";
    const pageButtonsDiv = document.getElementById("pinned_pagination")
    const searchPagination = document.getElementById("search_pagination")
    pageButtonsDiv.style.display = "none";
    searchPagination.style.display = "flex";    
})


function performSearch(){
    promptquery = searchinput.value;
        if(modeCheck.checked){
            mode = "private";
        }
        else{
            mode = "public";
        }
        data = {"query": promptquery,"category" : selectedValue,"mode" : mode};
        console.log(data);
        fetch("http://localhost:5000/search",{
        method:"POST",
        headers:{
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    }).then((response) =>{
        if (response.status === 404) {
            throw new Error('No data Found');
        }
        return response.json();
    }).then((msg)=>{
        starting.style.display = "none";
        displayResult.style.display = "flex";
        console.log(msg);
        const itemsPerPage = 2;
        const items = msg;
        console.log(items)
        const itemsList = document.getElementById("displayResult")
        const searchpageButtonsDiv = document.getElementById("search_pagination")
        searchpageButtonsDiv.style.display = "flex";
        const prevBtn = document.getElementById("search-prev-btn");
        const nextBtn = document.getElementById("search-next-btn");
        let currentPage = 1;

        function displayItems(pageNumber){
            itemsList.innerHTML = "";
        
            const startIndex = (pageNumber - 1)* itemsPerPage;
            const endIndex = startIndex+itemsPerPage;
            const itemsToDisplay = items.slice(startIndex, endIndex);
        
        
            itemsToDisplay.forEach((item) => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "one";

                const truncatedPrompt = item.prompt.length > 50 ? item.prompt.slice(0, 50) + "..." : item.prompt;
                

                itemDiv.innerHTML = `
                <div class="title">
                    <p>${item.title}</p>
                    <div class="btns">
                        <button class="disp copy-button"><i class="fas fa-copy"></i></button>
                        ${item.isPinned ? '<button class="disp unpin-button"><span><i class="fas fa-thumbtack" id="pin" style="margin-left:-1px"></i><i class="fas fa-slash" id="slash"></i></span></button>':'<button class="disp pin-button"><i class="fas fa-thumbtack" id="pin"></i></button>'}
                        <button class="disp edit-button"><i class="fas fa-edit"></i></button>
                        ${item.public ? '' : '<button class="disp del-button"><i class="fas fa-trash-alt"></i></button>'}
                    </div>
                </div>
                <div class="prompt_category">${item.category}</div>
                <div class="prompt" title="${item.prompt}">${truncatedPrompt}</div>
                `;

                
                const copyBtn = itemDiv.querySelector(".copy-button");
                copyBtn.addEventListener('click',()=>{
                    const promptId = item.prompt;
                    console.log(promptId);
                    copyPrompt(promptId)
                })

                const editBtn = itemDiv.querySelector(".edit-button");
                editBtn.addEventListener('click',function(){
                        const left = (screen.width - 600) /2;
                        const top = (screen.height - 300) /2;
                        const popupWindow = chrome.windows.create({ type: 'popup', url: 'edit.html', width:500, height: 300, left:left, top:top});
                        // const promptId = item.prompt;
                        const dataToSend = {
                            promptId : item.prompt,
                            title : item.title,
                            category : item.category
                        }
                        chrome.runtime.sendMessage(popupWindow.id,dataToSend);
                })

                const delBtn = itemDiv.querySelector(".del-button");
                if(delBtn){
                    delBtn.addEventListener('click',function(){
                        const promptId = item.prompt;
                        deletePrompt(promptId,storedJWT);
                        itemDiv.remove();
                        const indexToRemove = items.findIndex(item => item.prompt === promptId);
                        if (indexToRemove != -1) {
                            items.splice(indexToRemove, 1);
                        }
                        displayItems(currentPage);
                        updatePaginationButtons();
                    })
                }

                const pinBtn = itemDiv.querySelector(".pin-button");
                const unpinBtn = itemDiv.querySelector('.unpin-button');
                if(pinBtn){
                    pinBtn.addEventListener('click',function(){
                        console.log("Pinning");
                        console.log("Before Pinning",item.isPinned);
                        item.isPinned = true;
                        console.log("After",item.isPinned);
                        pinPrompt(item.prompt,storedJWT);
                        displayItems(currentPage);
                    })
                }
                if(unpinBtn){
                    unpinBtn.addEventListener('click',function(){
                            const promptId = item.prompt;
                            console.log("UnPin");
                            console.log("Before : ",item.isPinned);
                            item.isPinned = false;
                            console.log("After : ",item.isPinned);
                            unpinPrompt(item.prompt,storedJWT)
                            displayItems(currentPage);
                    })
                }
                itemsList.appendChild(itemDiv);
            });
            currentPage = pageNumber;
            updatePaginationButtons();
        }
        
        function createPaginationButtons(){
            const totalPages = Math.ceil(items.length / itemsPerPage);
        
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement("button");
                button.textContent = i;
                button.addEventListener("click", () => displayItems(i));
                paginationDiv.appendChild(button);
            }
        }
        
        
        function updatePaginationButtons(){
            const totalPages = Math.ceil(items.length / itemsPerPage);
        
            if(currentPage === 1){
                prevBtn.disabled = true;
                prevBtn.style.display = "none";
            }else{
                prevBtn.disabled = false;
                prevBtn.style.display = "block";
            }
        
            if(currentPage === totalPages){
                nextBtn.disabled = true;
                nextBtn.style.display = "none";
            }
            else{
                nextBtn.disabled = false;
                nextBtn.style.display = "block";
            }
        
            document.querySelectorAll("#search-page-buttons button").forEach((btn) => {
                btn.classList.remove("active");
            });
            document.querySelector(`#search-page-buttons button:nth-child(${currentPage})`).classList.add("active");
        }
        
        
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                displayItems(currentPage - 1);
            }
        });
        
        nextBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(items.length / itemsPerPage);
            if (currentPage < totalPages) {
                displayItems(currentPage + 1);
            }
        });
        displayItems(currentPage);
        createPaginationButtons();
        updatePaginationButtons();
    }).catch((error)=>{
        if (error.message === 'No data Found') {
            console.log('No data Found'); 
            setMessage("No results Found!",success)
        } else {
            console.error(error); 
        }
    })
    searchinput.value = "";
    catSelected.innerHTML = "All";
    if(modeCheck.checked){
        modeCheck.checked = false;
    }
}

function copyPrompt(promptId){
    console.log("copy"+promptId);
    data = {"query" : promptId};
    navigator.clipboard.writeText(promptId);
    setMessage("Copied","success");
}

function editPrompt(promptId,editedPrompt,storedJWT){
    data = {"originalPrompt" : promptId,"editedPrompt":editedPrompt}
    fetch("http://localhost:5000/update",{
        method :  "POST",
        headers : {
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    }).then((response) => response.json())
    .then((msg) => {
        console.log(msg);
        setMessage("Edited Successfully","success");
    }).catch((error) => {
        console.log("An error occurred : ",error);
    })
}

function deletePrompt(promptId,storedJWT){
    data  = {"query" : promptId};
    fetch("http://localhost:5000/delete",{
        method : "POST",
        headers : {
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    }).then((response) => response.json()).then((msg)=> {
        console.log(msg);
        setMessage("Deleted Successfully","success");
    }).catch((error) => {
        console.log("An error occured :",error);
    })
}

function pinPrompt(promptId,storedJWT){
    console.log("Pin the Prompt",promptId);
    data = {"query":promptId};
    fetch("http://localhost:5000/pin",{
        method : "POST",
        headers : {
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    }).then((response) => response.json()).then((msg) => {
        console.log(msg);
        setMessage("Pinned Successfully","success")
    }).catch((error) => {
        console.log("An error occurred : ",error);
    })
}

function unpinPrompt(promptId,storedJWT){
    console.log("UnPin the Prompt",promptId);
    data = {"query":promptId};
    fetch("http://localhost:5000/unpin",{
        method : "POST",
        headers : {
            'Authorization' : `Bearer ${storedJWT}`,
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(data)
    }).then((response) => response.json()).then((msg) => {
        console.log(msg);
        setMessage("Unpinned Successfully","success");
    }).catch((error) => {
        console.log("An error occurred : ",error);
    })
}

function setMessage(message, type) {
    const messageElement = type === 'success' ? document.getElementById('successMessage') : document.getElementById('errorMessage');
    messageElement.classList.add('success-message');
    messageElement.textContent = message;
    setTimeout(() => {
        messageElement.classList.remove('success-message');
        messageElement.textContent = '';
    }, 1000);

}
