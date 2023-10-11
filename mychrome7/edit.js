chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    const editPrompt = document.getElementById("edit_prompt");
    editPrompt.value = message.promptId;
    console.log(message.promptId);
    const editTitle = document.getElementById("edit_title");
    editTitle.value = message.title;
    const editCat = document.getElementById("edit_category");
    editCat.value = message.category;
})