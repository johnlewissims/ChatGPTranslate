let cursorPosition = { x: 0, y: 0 };
let translateIcon = null;
let selectedText = "";

// Track the cursor position
document.addEventListener('mousemove', (event) => {
    cursorPosition = { x: event.clientX, y: event.clientY };
});

// Show the translate icon when text is selected
document.addEventListener('mouseup', () => {
    selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        showTranslateIcon();
    } else {
        hideTranslateIcon();
    }
});

// Hide the translate icon when clicking away
document.addEventListener('mousedown', (event) => {
    if (translateIcon && !translateIcon.contains(event.target)) {
        hideTranslateIcon();
    }
});

function showTranslateIcon() {
    if (!translateIcon) {
        translateIcon = document.createElement('img');
        translateIcon.src = chrome.runtime.getURL('icons/icon.png');
        translateIcon.style.position = 'absolute';
        translateIcon.style.cursor = 'pointer';
        translateIcon.style.zIndex = '10000';
        translateIcon.style.width = '24px';
        translateIcon.style.height = '24px';
        translateIcon.addEventListener('click', showTranslationPopup);
        document.body.appendChild(translateIcon);
    }
    translateIcon.style.top = `${cursorPosition.y + window.scrollY}px`;
    translateIcon.style.left = `${cursorPosition.x + window.scrollX}px`;
    translateIcon.style.display = 'block';
}

function hideTranslateIcon() {
    if (translateIcon) {
        translateIcon.style.display = 'none';
    }
}

function showTranslationPopup() {
    // Change icon to loading spinner
    translateIcon.src = chrome.runtime.getURL('icons/loading-spinner.gif');

    if (selectedText) {
        chrome.runtime.sendMessage({ action: 'translateAndExplain', text: selectedText, cursorPosition: cursorPosition }, response => {
            if (response.error) {
                alert('Error fetching translation.');
                console.error('Error:', response.error);
            } else {
                hideTranslateIcon();
                translateIcon.src = chrome.runtime.getURL('icons/icon.png');
                showPopup(response.translation, response.explanation, response.breakdown);
            }
        });
    }
}

function showPopup(translation, explanation, breakdown) {
    chrome.storage.local.get(['alwaysDisplayExplanation', 'alwaysDisplayBreakdown'], (data) => {
        const alwaysDisplayExplanation = data.alwaysDisplayExplanation || false;
        const alwaysDisplayBreakdown = data.alwaysDisplayBreakdown || false;

        const popup = document.createElement('div');
        popup.id = 'translation-popup';
        popup.style.position = 'absolute';
        popup.style.top = `${cursorPosition.y + window.scrollY}px`;
        popup.style.left = `${cursorPosition.x + window.scrollX}px`;
        popup.style.backgroundColor = 'white';
        popup.style.border = '1px solid black';
        popup.style.padding = '10px';
        popup.style.zIndex = '10000';

        popup.innerHTML = `<p><strong>Translation:</strong> ${translation}</p>`;

        if (alwaysDisplayExplanation) {
            popup.innerHTML += `<p><strong>Explanation:</strong> ${explanation}</p>`;
        } else {
            const explanationLink = document.createElement('a');
            explanationLink.href = '#';
            explanationLink.textContent = 'See Explanation';
            explanationLink.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the default link behavior
                const explanationParagraph = document.createElement('p');
                explanationParagraph.innerHTML = `<strong>Explanation:</strong> ${explanation}`;
                popup.appendChild(explanationParagraph);
                explanationLink.style.display = 'none'; // Hide the link after it's clicked
            });
            popup.appendChild(explanationLink);
        }

        if (alwaysDisplayBreakdown) {
            popup.innerHTML += `<p><strong>Breakdown:</strong> ${breakdown}</p>`;
        } else {
            const breakdownLink = document.createElement('a');
            breakdownLink.href = '#';
            breakdownLink.textContent = 'See Breakdown';
            breakdownLink.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the default link behavior
                const breakdownParagraph = document.createElement('p');
                breakdownParagraph.innerHTML = `<strong>Breakdown:</strong> ${breakdown}`;
                popup.appendChild(breakdownParagraph);
                breakdownLink.style.display = 'none'; // Hide the link after it's clicked
            });
            popup.appendChild(breakdownLink);
        }

        document.body.appendChild(popup);

        const hidePopup = (event) => {
            if (popup && !popup.contains(event.target) && event.target !== translateIcon) {
                popup.remove();
                hideTranslateIcon();
                document.removeEventListener('mousedown', hidePopup);
            }
        };

        document.addEventListener('mousedown', hidePopup);
    });
}
