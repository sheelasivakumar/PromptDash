document.addEventListener('DOMContentLoaded', function () {
    const openAddPageButton = document.getElementById('add');
  
    openAddPageButton.addEventListener('click', function () {
      const left = (screen.width - 600) /2;
      const top = (screen.height - 300) /2;
      chrome.windows.create({ type: 'popup', url: 'home.html', width:500, height: 300, left:left, top:top});
    });
});