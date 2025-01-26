import { MessageActions } from '@src/constants/messageActions';
import CursorTracker from './CursorTracker';
import PopupManager from './PopupManager';
import SettingsService from '@src/background/SettingsService';
import SelectionService from '@src/background/SelectionService';
import TranslationService, {
    TranslationResponse,
} from '@src/background/TranslationService';
import { ErrorMessages } from '@src/constants/errorMessages';
import { getURL } from './chrome';

type Icon = HTMLImageElement | null;

class TranslateIcon {
    MAX_LENGTH_TEXT_FOR_TRANSLATION = 500;
    MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION = 40;
    ROW_GAP_BETWEEN_ICONS = 32;
    LOADER_URL = 'icons/loading-spinner.gif';
    CustomIconAttributes = {
        iconUrl: 'data-icon-url',
        iconLoaderUrl: 'data-icon-loader-url',
    };

    public icon: Icon;
    public iconDetailed: Icon;

    get icons() {
        return [this.icon, this.iconDetailed];
    }

    constructor() {
        this.icon = null;
        this.iconDetailed = null;
    }

    init() {}

    updateIconAndHideAnother(selectedIcon: Icon) {
        this.icons.map((icon) => {
            if (icon !== null && icon === selectedIcon) {
                const iconLoaderUrl = icon.getAttribute(
                    this.CustomIconAttributes.iconLoaderUrl,
                );
                icon.src = getURL(iconLoaderUrl!);
            } else if (icon) {
                icon.style.display = 'none';
            }
        });
    }

    resetIcons() {
        this.icons.map((icon) => {
            if (!icon) {
                return;
            }
            const iconUrl = icon.getAttribute(
                this.CustomIconAttributes.iconUrl,
            );
            icon.src = getURL(iconUrl!);
        });
    }

    translationResponseHandler(response: TranslationResponse) {
        if (response.error) {
            alert('Error fetching translation.');
            console.error('Error:', response.error);
        } else {
            this.hide();
            this.resetIcons();
            PopupManager.show({
                translation: response.translation,
                text: response.text as string,
                action: response.action as string,
                isDetailed: response.isDetailed,
            });
        }
    }

    displayIconDetailed() {
        const selectedText = SelectionService.getSelectedText();
        return (
            selectedText &&
            selectedText.length <= this.MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION
        );
    }

    createIcon(iconUrl: string) {
        const icon = document.createElement('img');
        icon.style.position = 'absolute';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '10000';
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.margin = '0';
        icon.style.padding = '0';
        icon.style.backgroundColor = 'white';
        icon.style.borderRadius = '4px';
        icon.src = getURL(iconUrl);
        icon.setAttribute('data-icon-url', iconUrl);
        icon.setAttribute('data-icon-loader-url', this.LOADER_URL);
        return icon;
    }

    show() {
        if (
            this.icon?.style?.display === 'block' ||
            this.iconDetailed?.style?.display === 'block'
        ) {
            // It's a call triggered by the onClick event of one of the icons.
            return;
        }

        const { x, y, scrollX, scrollY } = CursorTracker.getPosition();
        const scrollXWithShift = scrollX + 16;
        if (!this.icon) {
            this.icon = this.createIcon('icons/icon.png');
            this.icon.title = 'Translate the selected text';
            this.icon.addEventListener('click', () =>
                this.onClick(
                    this.icon,
                    this.MAX_LENGTH_TEXT_FOR_TRANSLATION,
                    MessageActions.translateAndExplain,
                ),
            );
            document.body.appendChild(this.icon);
            this.icon.style.top = `${y + scrollY}px`;
            this.icon.style.left = `${x + scrollXWithShift}px`;
        }

        if (this.icon.style.display !== 'block') {
            this.icon.style.top = `${y + scrollY}px`;
            this.icon.style.left = `${x + scrollXWithShift}px`;
        }

        this.icon.style.display = 'block';

        if (!this.iconDetailed) {
            this.iconDetailed = this.createIcon(
                'icons/iconDetailedTranslation.png',
            );
            this.iconDetailed.title =
                'Translate the selected text and provide usage options with examples.';
            this.iconDetailed.addEventListener('click', () =>
                this.onClick(
                    this.iconDetailed,
                    this.MAX_LENGTH_TEXT_FOR_DETAILED_TRANSLATION,
                    MessageActions.translateDetailed,
                ),
            );
            document.body.appendChild(this.iconDetailed);
            this.iconDetailed.style.top = `${y + scrollY}px`;
            this.iconDetailed.style.left = `${x + this.ROW_GAP_BETWEEN_ICONS + scrollXWithShift}px`;
        }
        if (this.iconDetailed.style.display !== 'block') {
            this.iconDetailed.style.top = `${y + scrollY}px`;
            this.iconDetailed.style.left = `${x + this.ROW_GAP_BETWEEN_ICONS + scrollXWithShift}px`;
        }

        if (this.displayIconDetailed()) {
            this.iconDetailed.style.display = 'block';
        }
    }

    hide() {
        if (this.icon) {
            this.icon.style.display = 'none';
        }
        if (this.iconDetailed) {
            this.iconDetailed.style.display = 'none';
        }
    }

    isVisible() {
        return this.icon && this.icon.style.display === 'block';
    }

    contains(target: EventTarget) {
        return (
            (this.icon && this.icon.contains(target as Node)) ||
            (this.iconDetailed && this.iconDetailed.contains(target as Node))
        );
    }

    async onClick(icon: Icon, maxTextLength: number, action: string) {
        const isAPIKeyValid = !!(await SettingsService.getAPIKey().catch(
            (err) => {
                if (err.message === ErrorMessages.APIKeyNotSet) {
                    window
                        .open(getURL('views/settings.html'), '_blank')
                        ?.focus();
                } else if (err.message) {
                    alert(err.message);
                }
            },
        ));
        if (!isAPIKeyValid) {
            return;
        }

        this.updateIconAndHideAnother(icon);
        const { selectedText, languageCode } =
            SelectionService.getSelectedTextAndLanguageCode();
        if (!selectedText) {
            return;
        }
        if (selectedText.length > maxTextLength) {
            alert(
                `Selected text is too long. Please select less than ${maxTextLength} characters.`,
            );
            this.hide();
            this.resetIcons();
            return;
        }
        const isDetailed = action === MessageActions.translateDetailed;
        const callbackTranslation = this.translationResponseHandler.bind(this);
        const message = {
            action,
            text: selectedText,
            languageCode,
            isDetailed,
        };

        TranslationService.handleTranslation(message, callbackTranslation);
    }
}

export default new TranslateIcon();
