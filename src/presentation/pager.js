import Settings from "../data/settings.js";

/**
 * @return {int} the index of the first page
 */
export const getFirstPage = () => 0;

/**
 * @return {int} the number of items per page
 */
export const getItemsPerPage = () => Settings.getMaxItemsPerSection();

/**
 * @param {int} page
 * @return {int} the index of the first item in the given page
 */
export const getFirstItemInPage = (page, itemsPerPage = getItemsPerPage()) =>
    page * itemsPerPage;

/**
 * @param {int} page
 * @return {int} the index of the last item in the given page
 */
export const getLastItemInPage = (page) => {
    const itemsPerPage = getItemsPerPage();
    return getFirstItemInPage(page, itemsPerPage) + itemsPerPage - 1;
};

/**
 * @param {int} page
 * @return {boolean} whether the given page is the first or not
 */
export const isFirstPage = (page) => page === getFirstPage();

/**
 * @param {int} page
 * @param {Array} items
 * @return {boolean} whether the given page is the last or not
 */
export const isLastPage = (page, items) =>
    getLastItemInPage(page) >= items.length - 1;
