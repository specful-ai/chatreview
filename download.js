async function downloadZip(files) {
    const zip = new JSZip();

    for (const [filename, content] of Object.entries(files)) {
        zip.file(filename, content);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    return URL.createObjectURL(blob);
}

function actualDownload() {
    let groups = document.querySelectorAll(".group.w-full.text-token-text-primary");
    let lastGroup = groups[groups.length - 1];
    let nodes = lastGroup.querySelectorAll(".markdown pre code.hljs");
    let files = {};

    nodes.forEach(node => {
        let pre = node.closest("pre");
        let distance = 0;
        for (let el = pre.previousElementSibling; el; el = el.previousElementSibling) {
            distance++;
            if (el.tagName.toLowerCase() === "pre") {
                break;
            }
            // Case: <h3>filename</h3>
            if (el.tagName.toLowerCase() === "h3" && /\.\w+$/.test(el.textContent)) {
                files[el.textContent] = node.textContent;
                break;
            }
            // Case: <ol> and a nested <code> or <strong>
            if (el.tagName.toLowerCase() === "ol") {
                let filenameElem = el.querySelector("code:not([class])");
                if (filenameElem && /\.\w+$/.test(filenameElem.textContent)) {
                    files[filenameElem.textContent] = node.textContent;
                    break;
                }
                filenameElem = el.querySelector("strong:not([class])");
                if (filenameElem && /\.\w+$/.test(filenameElem.textContent)) {
                    files[filenameElem.textContent] = node.textContent;
                    break;
                }
            }
            // Case: <p><strong>2. <code>filename</code></strong> (optional: some comments about the file):</p>
            if (el.tagName.toLowerCase() === "p" && el.querySelector("strong")) {
                let strongElem = el.querySelector("strong");
                // Ensure only one <strong> child in <p>
                if (strongElem && el.childElementCount === 1) {
                    let filenameElem = strongElem.querySelector("code:not([class])");
                    // Ensure only one <code> child in <strong>
                    if (filenameElem && strongElem.childElementCount === 1 && /\.\w+$/.test(filenameElem.textContent)) {
                        files[filenameElem.textContent] = node.textContent;
                        break;
                    }
                }
            }
            // Case: <p><code>filename</code>:</p>
            if (el.tagName.toLowerCase() === "p" && distance <= 2) {
                let filenameElem = el.querySelector("code:not([class])");
                if (filenameElem &&
                    getComputedStyle(filenameElem).fontWeight === "600" &&
                    el.textContent.trim() === filenameElem.textContent.trim() + ":") {
                    files[filenameElem.textContent] = node.textContent;
                    break;
                }
            }
            // Case: <p><strong>filename</strong>:</p>
            if (el.tagName.toLowerCase() === "p" && distance <= 2) {
                let filenameElem = el.querySelector("strong");
                if (filenameElem &&
                    el.childElementCount === 1 &&
                    el.textContent.trim() === filenameElem.textContent.trim() + ":") {
                    files[filenameElem.textContent] = node.textContent;
                    break;
                }
            }
        }
    });

    console.log(files);
    downloadZip(files).then((url) => {
        console.log(url);
        chrome.runtime.sendMessage({
            action: "downloadUrl",
            url: url,
            filename: "archive.zip"
        });
    });
}

function waitResponse() {
    let prompt = document.getElementById("prompt-textarea");
    let button = prompt.nextSibling;
    if (!button || button.tagName.toLowerCase() !== "button") {
        throw new Exception("unexpected node", button);
    }
    if (button.disabled) {
        let span = button.querySelector("span");
        if (span && span.dataset.state === "closed") {
            return actualDownload();
        }
        setTimeout(waitResponse, 1000);
    }
}

function downloadAllFiles() {
    let prompt = document.getElementById("prompt-textarea");
    prompt.value = "Please give me all source code files in the following format:\n\n`filename.ext`:\n```\ncontent\n```";
    prompt.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(function () {
        prompt.nextSibling.click();
        setTimeout(function () {
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(waitResponse, 1000);
        }, 1000);
    }, 250);
}

downloadAllFiles();
