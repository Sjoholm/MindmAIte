chrome.storage.local.get('selectedText', function(data) {
    let selectedText = data.selectedText;
    // Do something with the selected text in the popup
    document.body.innerHTML = `<p>You've selected: ${selectedText}</p>`;
});