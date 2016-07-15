/**
 * # Authorization codes example file
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * File must export an array of objects containing at the very least two
 * properties: _AccesCode_, and _ExitCode_. The values of such properties
 * must be unique.
 *
 * For real authorization codes use at least 32 random characters and digits.
 * ---
 */

var path = require('path');

module.exports = function(settings, done) {
    var nCodes, i, codes;
    var dk, confPath;
    var format;
debugger
    // Synchronous.

    if (settings.mode === 'auto') {

        nCodes = 100;
        codes = [];

        for (i = 0 ; i < nCodes; i ++) {
            codes.push({
                id: i + '_access',
                // Add pwd field for extra security.
                // pwd: i + '_pwd',
                ExitCode: i + '_exit',
                AccessCode: i + '_access'
            });
        }
        return codes;
    }
    
    if (settings.mode === 'local') {
        if ('string' !== typeof settings.file || settings.file.trim() === '') {
            throw new TypeError('auth.settings: settings.file must be a ' +
                                'non-empty string when mode="local". Found: ' +
                                settings.file);
        }

        

        if (!fs.existsSync(settings.file)) {
            throw new TypeError('auth.settings: mode="local", but ' +
                                'settings.file specifies a non-existing ' +
                                'file: ' + settings.file);
        }

        format = settings.file.lastIndexOf('.');
        // If not specified format is JSON.
        format = format < 0 ? 'json' : settings.file.substr(format+1);
        
        // CSV.
        if (format === 'csv') {
            (function() {
                var csv, reader;
                codes = [];
                csv = require('ya-csv');
                reader = csv.createCsvFileReader(settings.file, {
                    'separator': ',',
                    'quote': '"',
                    'escape': '"',       
                    'comment': '',
                });
                reader.addListener('data', function(data) {
                    debugger;
                    codes.push(data);
                    // supposing there are so named columns in the source file
                    // sys.puts(data.col1 + " ... " + data.col2);
                });
                reader.addListener('end', function(data) {
                    debugger;
                    done(null, codes);
                });
            })();
            
        }
        // JSON
        else {
            codes = require(settings.file);
        }

        return codes;
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


    
};
