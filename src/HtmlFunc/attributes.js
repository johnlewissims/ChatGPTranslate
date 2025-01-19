export const enableElementById = (id) => {
    document.getElementById(id).removeAttribute('disabled');
};

export const disableElementById = (id) => {
    document.getElementById(id).setAttribute('disabled', true);
};

export const hideElementById = (id) => {
    document.getElementById(id).classList.add('hidden');
};

export const showElementById = (id) => {
    document.getElementById(id).classList.remove('hidden');
};
