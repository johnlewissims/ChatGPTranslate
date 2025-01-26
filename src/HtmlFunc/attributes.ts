export const enableElementById = (id: string) => {
    document.getElementById(id)?.removeAttribute('disabled');
};

export const disableElementById = (id: string) => {
    document.getElementById(id)?.setAttribute('disabled', 'disabled');
};

export const hideElementById = (id: string) => {
    document.getElementById(id)?.classList.add('hidden');
};

export const showElementById = (id: string) => {
    document.getElementById(id)?.classList.remove('hidden');
};
