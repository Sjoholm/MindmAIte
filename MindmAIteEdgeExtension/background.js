const OpenAiEndpoint = "https://api.openai.com/v1/chat/completions";
const OpenAiApiKey = "REPLACE_WITH_REAL_KEY"; 
const QuickChartApiUrl = "https://quickchart.io/graphviz?format=png&graph=";


chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "id": "mindmAIteContextMenu",
        "title": "MindmAIte",
        "contexts": ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "mindmAIteContextMenu") {
        handleContextMenuClick(info.selectionText);
    }
});

async function handleContextMenuClick(inputText) {
    console.log(`[${new Date().toISOString()}] Starting getDotLanguageFromOpenAi call...`);

    // Open the placeholder page
    const tab = await createTabWithContent("placeholder.html");

    try {
        const dotScript = await getDotLanguageFromOpenAi(inputText);
        console.log(`[${new Date().toISOString()}] Finished getDotLanguageFromOpenAi call. Starting getMindMapImageUrl call...`);

        const imageUrl = await getMindMapImageUrl(dotScript);
        console.log(`[${new Date().toISOString()}] Finished getMindMapImageUrl call. Updating tab content...`);

        // Send a message to the placeholder page to update its content
        chrome.runtime.sendMessage({ action: "updateContent", imageUrl: imageUrl });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);
    }
}

function createTabWithContent(pageName) {
    return new Promise((resolve, reject) => {
        chrome.tabs.create({ url: chrome.runtime.getURL(pageName) }, (tab) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(tab);
            }
        });
    });
}

async function getDotLanguageFromOpenAi(inputText) {
    const headers = new Headers({
        "Authorization": `Bearer ${OpenAiApiKey}`,
        "Content-Type": "application/json"
    });

    const payload = {
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "I want a mind map in form of Graphviz dot script. Just give me the script and don't type anything else than the actual script. No backticks before and after the script. The edges should be arrows. No colors."
            },
            {
                role: "user",
                content: inputText
            }
        ]
    };

    const response = await fetch(OpenAiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });

    const responseBody = await response.json();
    return responseBody.choices[0].message.content.trim();
}

async function getMindMapImageUrl(dotScript) {
    const encodedDotScript = encodeURIComponent(dotScript);
    const apiUrl = QuickChartApiUrl + encodedDotScript;

    const response = await fetch(apiUrl);
    const blob = await response.blob();
    return blobToDataURL(blob);
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function() {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}