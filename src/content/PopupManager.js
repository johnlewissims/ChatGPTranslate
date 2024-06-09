import CursorTracker from './CursorTracker.js';
import TranslateIcon from './TranslateIcon.js';

class PopupManager {
    show(translation, explanation, breakdown) {
        chrome.storage.local.get(['alwaysDisplayExplanation', 'alwaysDisplayBreakdown'], (data) => {
            const alwaysDisplayExplanation = data.alwaysDisplayExplanation || false;
            const alwaysDisplayBreakdown = data.alwaysDisplayBreakdown || false;

            const popup = document.createElement('div');
            popup.id = 'translation-popup';
            const { x, y, scrollX, scrollY } = CursorTracker.getPosition();
            popup.style.position = 'absolute';
            popup.style.top = `${y + scrollY}px`;
            popup.style.left = `${x + scrollX}px`;
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
                    event.preventDefault();
                    const explanationParagraph = document.createElement('p');
                    explanationParagraph.innerHTML = `<strong>Explanation:</strong> ${explanation}`;
                    popup.appendChild(explanationParagraph);
                    explanationLink.style.display = 'none';
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
                    event.preventDefault();
                    const breakdownParagraph = document.createElement('p');
                    breakdownParagraph.innerHTML = `<strong>Breakdown:</strong> ${breakdown}`;
                    popup.appendChild(breakdownParagraph);
                    breakdownLink.style.display = 'none';
                });
                popup.appendChild(breakdownLink);
            }

            document.body.appendChild(popup);

            const hidePopup = (event) => {
                if (popup && !popup.contains(event.target) && event.target !== TranslateIcon.icon) {
                    popup.remove();
                    TranslateIcon.hide();
                    document.removeEventListener('mousedown', hidePopup);
                }
            };

            document.addEventListener('mousedown', hidePopup);
        });
    }
}

export default new PopupManager();
