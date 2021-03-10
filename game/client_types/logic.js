/**
 * # Logic code for Artex
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

const path = require('path');
const ngc = require('nodegame-client');
const stepRules = ngc.stepRules;
const J = ngc.JSUS;
const fs = require('fs');

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    let channel = gameRoom.channel;
    let node = gameRoom.node;

    var cacheToSave, timeOutSave;
    cacheToSave = [];

    stager.setOnInit(function() {
        var saveWhoConnected;

        // Create data dir. TODO: do it automatically?
        let dataDir = path.resolve(channel.getGameDir(), 'data');

        node.on.data('finished_part1', function(msg) {
            var db;

            // Move client to part2
            // (async so that it finishes all current step operations).
            setTimeout(function() {
                console.log('moving client to part2: ', msg.from);
                channel.moveClientToGameLevel(msg.from, 'part2', gameRoom.name);
            }, 100);

            // Save client's data.
            db = node.game.memory.player[msg.from];
            // db.save(dataDir + 'artex_part1.csv', saveOptions);
            // db.save(dataDir + 'artex_part1_b.csv');
            // DB does not exist if we skipped all previous stages.
            if (db) {
                db.save(path.join(dataDir, 'artex_part1.json'), { flag: 'a' });
            }
        });

        // Store some values inside the
        // Select a random value of svo decision.
        node.on.data('done', function(msg) {
            var svo, code;
            if (!msg.data) return;
            code = channel.registry.getClient(msg.from);
            if (msg.data.id && msg.data.id === 'svo') {
                svo = '' + J.randomInt(0,6); // From 1 to 6.
                code.svo = msg.data.items[svo].choice;
            }
            else if (msg.data.gender) {
                code.gender = msg.data.gender.choice;
                code.location = msg.data.location.choice;
                // code.job = msg.data.job.choice;
            }
        });

        // Notify waiting room that somebody reconnect/disconnected.
        // Might need to re-open/close the HIT.

        node.on.preconnect(function(p) {
            channel.waitingRoom.ON_CONNECT(channel.waitingRoom, p);
        });

        node.on.pdisconnect(function(p) {
            channel.waitingRoom.ON_DISCONNECT(channel.waitingRoom, p);
        });

        // Saves time, id and worker id of connected clients (with timeout).
        saveWhoConnected = function(p) {

            cacheToSave.push(Date.now() + "," + p.id + "," +
                             (p.WorkerId || 'NA') + "," +
                             (p.userAgent ? '"' + p.userAgent + '"' : 'NA'));

            if (!timeOutSave) {
                timeOutSave = setTimeout(function() {
                    var txt;
                    txt = cacheToSave.join("\n") + "\n";
                    cacheToSave = [];
                    timeOutSave = null;
                    fs.appendFile(path.join(dataDir, 'codes.csv'), txt,
                        function(err) {
                        if (err) {
                            console.log(txt);
                            console.log(err);
                        }
                    });
                }, 10000);
            }
        }

        if (node.game.pl.size()) node.game.pl.each(saveWhoConnected);

        node.on.pconnect(saveWhoConnected);

        console.log('init');

    });

    stager.setDefaultStepRule(stepRules.SOLO);

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc_part1',
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState(),
        // If debug is false (default false), exception will be caught and
        // and printed to screen, and the game will continue.
        debug: settings.DEBUG,
        // Controls the amount of information printed to screen.
        verbosity: 0,
        // nodeGame enviroment variables.
        env: {
            auto: settings.AUTO,
            review_select: !!settings.review_select,
            review_random: !!settings.review_random,
            com: !!settings.com,
            coo: !!settings.coo
        }
    };
};
