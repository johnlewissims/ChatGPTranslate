import { LanguageCodesOrEmptyString } from '@src/scripts/defaultSettings';

export type Message = {
    action: string;
    text: string;
    languageCode?: LanguageCodesOrEmptyString;
    isDetailed?: boolean;
    userDefinedLanguageCode?: LanguageCodesOrEmptyString;
    translation?: string;
    breakdown?: string;
    explanation?: string;
};
