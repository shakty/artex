/**
 * # Auth settings
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    enabled: true, // [true, false] Default: TRUE.

    mode: 'local', // ['remote', 'local', 'auto'] Default: 'auto'

    getcode: true, // function that returns true or a string with the error.

    file: 'codes.csv'

    // Must export a function that returns an array of codes synchronously
    // or asynchronously. Default: 'auth.codes.js'
    // codes: 'auth.codes.js',    

    // Not used.
    page: 'login.htm'
};
