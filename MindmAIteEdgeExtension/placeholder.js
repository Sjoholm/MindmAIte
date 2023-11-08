let secondsElapsed = 0;

// Start the timer
setInterval(() => {
    secondsElapsed++;
    document.getElementById("timer").textContent = secondsElapsed;
}, 1000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateContent" && message.imageUrl) {
        document.body.innerHTML = `<img src="${message.imageUrl}" style="width:100%; height:auto;">`;
    }
});
