/**
 * Create options for Select.
 *
 * @param {string} selectElementId
 * @param {Array|Object} optionsAsObjectWithKeyValueOrArray
 * @returns
 */
export const createOptions = (
    selectElementId,
    optionsAsObjectWithKeyValueOrArray,
) => {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        return;
    }

    const options = Array.isArray(optionsAsObjectWithKeyValueOrArray)
        ? optionsAsObjectWithKeyValueOrArray
        : Object.entries(optionsAsObjectWithKeyValueOrArray);

    for (const pair of options) {
        const option = document.createElement('option');
        option.value = pair[0];
        option.text = pair[1];
        selectElement.appendChild(option);
    }
};

export const clearAllChild = (selectElementId) => {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        return;
    }

    while (selectElement.firstChild) {
        selectElement.firstChild.remove();
    }
};
