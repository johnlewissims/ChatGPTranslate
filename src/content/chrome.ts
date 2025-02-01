export const getURL = (url: string) => chrome.runtime.getURL(url);

export const getVersion = () => {
    return chrome.runtime.getManifest().version;
};
