import { Message } from '@src/content/Message';

export type TranslationResponse = {
    error?: string;
    translation?: string;
    explanation?: string;
    audioDataUrl?: string;
} & Partial<Message>;
