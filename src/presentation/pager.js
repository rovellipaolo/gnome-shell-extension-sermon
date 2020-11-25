"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Settings = Me.imports.src.data.settings;

/**
 * @return {int} the index of the first page
 */
/* exported getFirstPage */
var getFirstPage = () => 0;

/**
 * @return {int} the number of items per page
 */
/* exported getItemsPerPage */
var getItemsPerPage = () => Settings.getMaxItemsPerSection();

/**
 * @param {int} page
 * @return {int} the index of the first item in the given page
 */
/* exported getFistItemInPage */
var getFistItemInPage = (page) => page * getItemsPerPage();

/**
 * @param {int} page
 * @return {int} the index of the last item in the given page
 */
/* exported getLastItemInPage */
var getLastItemInPage = (page) =>
    getFistItemInPage(page) + getItemsPerPage() - 1;

/**
 * @param {int} page
 * @return {boolean} whether the given page is the first or not
 */
/* exported isFirstPage */
var isFirstPage = (page) => page === getFirstPage();

/**
 * @param {int} page
 * @param {Array} items
 * @return {boolean} whether the given page is the last or not
 */
/* exported isLastPage */
var isLastPage = (page, items) => getLastItemInPage(page) >= items.length - 1;
