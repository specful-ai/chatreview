chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "chatReviewContextMenuDownloadAllSourceCodeFiles",
        title: "Download all source code files",
        contexts: ["page"],
        documentUrlPatterns: ["https://chat.openai.com/*"]
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadUrl") {
        chrome.downloads.download({
            url: message.url,
            filename: message.filename,
            saveAs: true // This will prompt the user where to save the file
        })
    }
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "chatReviewContextMenuDownloadAllSourceCodeFiles") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["jszip-v3.10.1.js", "download.js"]
        });
    }
});
