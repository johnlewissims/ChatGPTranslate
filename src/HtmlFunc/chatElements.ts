const createChatElement = (text: string, className: string) => {
    const elem = document.createElement('li');
    elem.classList.add(className);
    const textNode = document.createTextNode(text);
    elem.appendChild(textNode);
    return elem;
};

export const createAnswerElement = (text: string) => {
    return createChatElement(text, 'answer');
};
export const createQuestionElement = (text: string) => {
    return createChatElement(text, 'question');
};
