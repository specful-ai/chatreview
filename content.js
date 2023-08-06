function replaceNodeWithModifiedHTML() {
    let groups = document.querySelectorAll(".group.w-full.text-token-text-primary");
    let lastGroup = groups[groups.length - 1];
    let nodes = lastGroup.querySelectorAll(".markdown pre code.hljs");

    nodes.forEach(node => {
        let textLines = node.textContent.split("\n");
        let lines = node.innerHTML.split("\n");
        if (lines[lines.length - 1].length === 0) {
            lines.pop();
        }

        let table = document.createElement("table");
        table.className = "chatreview";
        table.appendChild(createInfoRow());
        lines.forEach((line, i) => {
            let tr = createTableRow(i + 1, textLines[i], line);
            table.appendChild(tr);
        });
        table.appendChild(createSubmitRow());

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        node.appendChild(table);
        node.style.display = "block";
    });
}

function createInfoRow() {
    let tr = document.createElement("tr");
    tr.className = "info-row";

    let td = document.createElement("td");
    td.colSpan = 2;

    let div = document.createElement("div");

    let p = document.createElement("p");
    p.textContent = "Click on line numbers to add review comments.";
    div.appendChild(p);

    td.appendChild(div);
    tr.appendChild(td);
    return tr;
}

function createTableRow(lineNumber, lineText, lineHTML) {
    let tr = document.createElement("tr");

    let tdNumber = document.createElement("td");
    tdNumber.textContent = lineNumber;
    tdNumber.className = "line-number";
    tdNumber.addEventListener('click', function () {
        if (tdNumber.classList.contains("muted")) {
            return;
        }
        if (!tr.nextSibling || !tr.nextSibling.classList.contains("review-row")) {
            let [newRow, textarea] = createInsertRow(lineNumber, lineText);
            tr.parentNode.insertBefore(newRow, tr.nextSibling);
            textarea.focus();
        }
    });

    let tdContent = document.createElement("td");
    tdContent.innerHTML = lineHTML;

    tr.appendChild(tdNumber);
    tr.appendChild(tdContent);
    return tr;
}

function createInsertRow(lineNumber, lineText) {
    let tr = document.createElement("tr");
    tr.className = "review-row";

    let td = document.createElement("td");
    td.colSpan = 2;

    let div = document.createElement("div");

    let textarea = document.createElement("textarea");
    textarea.className = "review-text";
    textarea.rows = 1;
    textarea.addEventListener("input", function () {
        // Reset textarea height
        this.style.height = "auto";
        // Adjust the height based on content's height
        this.style.height = this.scrollHeight + "px";
    });
    textarea.dataset.lineNumber = lineNumber;
    textarea.dataset.lineText = lineText;
    div.appendChild(textarea);

    let discard = document.createElement("button");
    discard.className = "discard-review";
    discard.textContent = "Discard";
    discard.addEventListener("click", function () {
        tr.remove();
    });
    div.appendChild(discard);

    td.appendChild(div);
    tr.appendChild(td);
    return [tr, textarea];
}

function createSubmitRow() {
    let tr = document.createElement("tr");
    tr.className = "submit-row";

    let td = document.createElement("td");
    td.colSpan = 2;

    let div = document.createElement("div");

    let submit = document.createElement("button");
    submit.className = "submit-review btn btn-neutral";
    submit.textContent = "Submit Review Comments";
    submit.addEventListener("click", function () {
        let reviews = "";
        let textareas = document.querySelectorAll("textarea.review-text");
        textareas.forEach(textarea => {
            if (reviews.length > 0) {
                if (reviews.charAt(reviews.length - 1) === '\n') {
                    reviews += "\n";
                } else {
                    reviews += "\n\n";
                }
            }
            reviews += "Line " + textarea.dataset.lineNumber + ":\n";
            reviews += "> " + textarea.dataset.lineText + "\n";
            reviews += textarea.value;
            textarea.closest(".review-row").remove();
        })
        if (reviews.length === 0) {
            return;
        }

        document.querySelectorAll(".submit-review.btn").forEach(btn => {
            btn.disabled = true;
        });
        document.querySelectorAll("td.line-number:not(.muted)").forEach(td => {
            td.classList.add("muted");
        });

        let prompt = document.getElementById("prompt-textarea");
        prompt.value = reviews;
        prompt.dispatchEvent(new Event("input", { bubbles: true }));
        setTimeout(function () {
            prompt.nextSibling.click();
            setTimeout(function () {
                window.scrollTo(0, document.body.scrollHeight);
            }, 1000);
        }, 250);
    });
    div.appendChild(submit);

    td.appendChild(div);
    tr.appendChild(td);
    return tr;
}

// Invoke the function
replaceNodeWithModifiedHTML();
