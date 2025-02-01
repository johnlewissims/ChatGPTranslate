/**
 * Create options for Select.
 *
 * @param {string} selectElementId
 * @param {Array|Object} optionsAsObjectWithKeyValueOrArray
 * @returns
 */
export const createOptions = (
    selectElementId: string,
    optionsAsObjectWithKeyValueOrArray:
        | []
        | [string, string | number][]
        | { [Property: string]: string },
) => {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        return;
    }

    const options = Array.isArray(optionsAsObjectWithKeyValueOrArray)
        ? (optionsAsObjectWithKeyValueOrArray as [string, string][])
        : Object.entries(optionsAsObjectWithKeyValueOrArray);

    for (const pair of options) {
        const option = document.createElement('option');
        option.value = pair[0];
        option.text = pair[1];
        selectElement.appendChild(option);
    }
};

export const clearAllChild = (selectElementId: string) => {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        return;
    }

    while (selectElement.firstChild) {
        selectElement.firstChild.remove();
    }
};
