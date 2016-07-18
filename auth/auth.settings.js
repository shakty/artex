/**
 * # Auth settings
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    /**
     * ## enabled
     *
     * If TRUE, authorization files will be imported and checked
     */
    enabled: true, // [true, false] Default: TRUE.

    /**
     * ## mode
     *
     * The mode for importing the authorization codes
     *
     * Available modes:
     *
     *   - 'dummy': creates dummy ids and passwords in sequential order.
     *   - 'auto': creates random 8-digit alphanumeric ids and passwords.
     *   - 'local': reads the authorization codes from a file. Defaults:
     *              codes.json, code.csv. A custom file can be specified
     *              in settings.file (available formats: json and csv).
     *   - 'remote': fetches the authorization codes from a remote URI.
     *               Available protocol: DeSciL protocol.
     *   - 'custom': The 'getCodesCb' property of the settings object
     *               will be executed with settings and done callback
     *               as parameters.
     *
     */
    mode: 'local',

    /**
     * ## inFile
     *
     * The name of the codes file inside auth/ dir or a full path to it
     *
     * Available formast: .csv and .json. Default values tried in sequence:
     * codes.json, code.csv.
     */
    // inFile: 'mycodes.csv',

    /**
     * ## dumpCodes
     *
     * If TRUE, all imported codes will be dumped to file
     *
     * Default: TRUE
     */
    // dumpCodes

    /**
     * ## outFile
     *
     * The name of the codes dump file inside auth/ dir or a full path to it
     *
     * Available formast: .csv and .json. Default name: codes.imported.csv
     */
    // outFile: 'my.imported.codes.csv',


    /**
     * ## getcode
     *
     * function that returns true or a string with the error. ??
     *
     * @xperimental
     */
    getcode: true,

    /**
     * ## importer
     *
     * Importer function processing the different import modes
     *
     * Must export a function that returns an array of codes synchronously
     * or asynchronously.
     */
    // codes: 'auth.codes.js',

    // # Reserved words for future requirements settings.

    // page: 'login.htm'
};
