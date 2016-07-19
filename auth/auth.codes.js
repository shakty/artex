/**
 * # Authorization codes example file
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Loads/Generates/Fetches the authorization codes for the channel
 *
 * Depending on settings.mode, different operations are performed:
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
 * File must export an array of objects containing at the very least
 * an 'id' field. All other
 *
 * Errors are thrown and caught by GameLoader.loadAuthDir
 * ---
 */

var path = require('path');
var fs = require('fs');
var J = require('JSUS').JSUS;

module.exports = function(settings, done) {
    var nCodes, i, codes;
    var dk, confPath;
    var format, code;
    var keys;

    // Synchronous.

    if (settings.mode === 'dummy') {

        nCodes = validateNCodes(settings.nCodes);
        codes = new Array(nCodes);

        for (i = 0 ; i < nCodes; i ++) {
            codes[i] = {
                id: i + '',
                AccessCode: i + '',
                ExitCode: i + 'exit'
            };
            // Optionally add a password field.
            if (settings.addPwd) code[i].pwd = i + '';
        }
        return codes;
    }

    if (settings.mode === 'auto') {
        keys = {};
        nCodes = validateNCodes(settings.nCodes);
        codes = new Array(nCodes);

        for (i = 0 ; i < nCodes; i ++) {
            codes[i] = {
                id: J.uniqueKey(keys, J.randomString(8, 'aA1')),
                AccessCode: J.uniqueKey(keys, J.randomString(6, 'aA1')),
                ExitCode: J.uniqueKey(keys, J.randomString(6, 'aA1'))
            };
            // Optionally add a password field.
            if (settings.addPwd) {
                code[i].pwd = J.uniqueKey(keys, J.randomString(8, 'aA1!'));
            }
        }
        return codes;
    }

    if (settings.mode === 'local') {

        // Default paths.
        if ('undefined' === typeof settings.file) {
            settings.file = settings.authDir + 'codes'; // .json and .js
            if (!fs.existsSync(settings.file)) {
                settings.file = settings.authDir + 'codes.csv';
                if (!fs.existsSync(settings.file)) {

                    throw new TypeError('auth.settings: mode="local", but ' +
                                        'codes.json and codes.csv not found.');
                }
            }
        }
        // Custom paths.
        else if ('string' === typeof settings.file ||
                 settings.file.trim() === '') {

            // Convert to absolute path.
            if (!path.isAbsolute(settings.file)) {
                settings.file = authDir + settings.file;
            }

            if (!fs.existsSync(settings.file)) {
                throw new TypeError('auth.settings: mode="local", but ' +
                                    'settings.file points to a non-existing ' +
                                    'file: ' + settings.file);
            }
        }
        else {
            throw new TypeError('auth.settings: settings.file must be a ' +
                                'non-empty string or undefined when ' +
                                'mode="local". Found: ' + settings.file);
        }

        // Get format, default JSON.
        format = getFormat(settings.file);

        // CSV.
        if (format === 'csv') {
            (function() {
                var csv, reader;
                codes = [];
                csv = require('ya-csv');
                reader = csv.createCsvFileReader(settings.file, {
                    separator: ',',
                    quote: '"',
                    escape: '"',
                    comment: '',
                    columnsFromHeader: true
                });
                reader.addListener('data', function(row) {
                    codes.push(row);
                });
                reader.addListener('end', function() {
                    done(null, codes);
                });
            })();
            return;
        }
        // JSON
        else {
            return require(settings.file);
        }
    }

    if (settings.mode === 'custom') {
        if ('function' !== typeof settings.customCb) {
            throw new Error('auth.settings: mode="customCb", but settings.' +
                            'customCb is not a function. Found: ' +
                            settings.customCb);
        }
        return settings.customCb(settings, done);
    }

    // Asynchronous.

    // Reads in descil-mturk configuration.
    confPath = path.resolve(__dirname, 'descil.conf.js');
    dk = require('descil-mturk')();

    dk.readConfiguration(confPath);

    // Load code database.
    if (settings.mode === 'remote') {

        // Convert format.
        dk.codes.on('insert', function(o) {
            o.id = o.AccessCode;
        });

        dk.getCodes(function() {
            if (!dk.codes.size()) {
                done('Auth.codes: no codes found!');
            }
            console.log(dk.codes.db);
            done(null, dk.codes.db);
        });
    }
    else if (settings.mode === 'local') {
        dk.readCodes(function() {
            if (!dk.codes.size()) {
                done('Auth.codes: no codes found!');
            }
        });
    }
    else {
        done('Auth.codes: Unknown settings.');
    }

    // ## Helper functions.

    function getFormat(file) {
        var format;
        format = file.lastIndexOf('.');
        // If not specified format is JSON.
        return format < 0 ? 'json' : file.substr(format+1);
    }

    function validateNCodes(nCodes, mode) {
        if ('undefined' !== typeof nCodes) {
            if ('number' !== typeof nCodes || nCodes < 1) {
                throw new Error('auth.codes: settings.nCodes must be a ' +
                                'number > 0 or undefined when mode is "' +
                                mode + '". Found: ' + nCodes);
            }
        }
        return nCodes || 100;
    }
};
