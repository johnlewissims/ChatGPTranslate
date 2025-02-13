import OpenAIService from '@src/background/OpenAIService';
import { ErrorMessages } from '@src/constants/errorMessages';
import {
    createAnswerElement,
    createQuestionElement,
} from '@src/HtmlFunc/chatElements';

const showAnswer = (text: string): void => {
    const newAnswer = createAnswerElement(text);
    const list = document.getElementById('answers-list') as HTMLUListElement;
    list.prepend(newAnswer);
};

const showQuestion = (text: string): void => {
    const newAnswer = createQuestionElement(text);
    const list = document.getElementById('answers-list') as HTMLUListElement;
    list.prepend(newAnswer);
};

const sendQuestionToGPT = async () => {
    const instructionInput = document.getElementById(
        'instruction',
    ) as HTMLInputElement;

    const messageTextarea = document.getElementById(
        'message-to-gpt',
    ) as HTMLTextAreaElement;

    const message = messageTextarea?.value?.trim() ?? '';
    if (!message) {
        showAnswer(ErrorMessages.EmptyMessage);
        return;
    }

    messageTextarea.value = '';
    showQuestion(message);

    const instruction = instructionInput?.value?.trim() ?? '';

    const response = await OpenAIService.sendChatMessage({
        message,
        instruction,
    });
    showAnswer(response.translation ?? ErrorMessages.EmptyMessage);
};

document.addEventListener('DOMContentLoaded', async () => {
    document
        .getElementById('send-message')
        ?.addEventListener('click', sendQuestionToGPT);
});

document.addEventListener('keyup', async (event: KeyboardEvent) => {
    if (!event.ctrlKey) {
        return;
    }

    if (event.key === 'Enter') {
        sendQuestionToGPT();
        return;
    }
});
