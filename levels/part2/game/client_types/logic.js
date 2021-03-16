/**
 * # Logic code for Artex
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

const J = require('nodegame-client').JSUS;
const path = require('path');

// Variable registered outside of the export function
// are shared among all instances of game logics.
let counter = 0;

// Flag to not cache required files.
let nocache = true;

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    let channel = gameRoom.channel;
    let node = gameRoom.node;
    let memory = node.game.memory;

    let pushClientsOpts = {
        offset: 12000, // Default: 5000
        reply: 4000, // Default: 2000
        check: 2000 // Default: 2000
    };
    //pushClientsOpts = true;

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID;

    // Import other functions used in the game.
    // Some objects are shared.
    let cbsPath = path.resolve(__dirname, 'includes', 'logic.callbacks.js');
    let cbs = channel.require(cbsPath, {
        node: node,
        gameRoom: gameRoom,
        settings: settings,
        counter: counter
        // Reference to channel added by default.
    }, nocache);

    // Event handler registered in the init function are always valid.
    stager.setOnInit(cbs.init);

    // Event handler registered in the init function are always valid.
    stager.setOnGameOver(cbs.gameover);

    stager.extendStep('instr_summary', {
        pushClients: pushClientsOpts,
        init: function() {

            // Notify how many players are connected (might be less, if
            // the dispatch is manual).
            node.say('PCOUNT', 'ROOM', node.game.pl.size());

            // Default color is black.
            if (settings.colors) {
                let keys = node.game.pl.id.getAllKeys();
                keys = J.shuffle(keys);
                // Do not send default color (black).
                keys.slice(0, 6).forEach((id, i) => {
                    let color = i < 3 ? 'green' : 'red';
                    node.say('MYCOLOR', id, color);
                });
            }
        }
    });

    stager.extendStage('artex', {
        pushClients: pushClientsOpts,
        minPlayers: [
            settings.MIN_PLAYERS,
            cbs.notEnoughPlayers,
            cbs.enoughPlayersAgain
        ],
        init: function() {
            node.on.pdisconnect(function() {
                var step;
                if (node.game.pl.size() === 1) {
                    node.remoteAlert('Unfortunately, all other players have ' +
                                     'disconnected. You are now redirected ' +
                                     'to the questionnaire.',
                                     node.game.pl.first().id);
                    step = node.game.plot.normalizeGameStage('final');
                    node.game.gotoStep(step);
                }
            });
        },
        reconnect: function(code, reconOptions) {
            var cf;
            cf = memory.cf.get(code.id);
            // cf0 is the initial random face.
            reconOptions.cf = cf.cf || cf.cf0;
            reconOptions.winners = node.game.winners;
            reconOptions.bonus = code.bonus;

            // If evaluation round, add reviews.
            if (node.player.stage.step === 3) {
                reconOptions.reviews = node.game.reviewing[code.id];
            }

            // This function is executed on the client.
            reconOptions.cb = function(options) {
                var i, len, w, table, step;
                this.last_cf = options.cf;

                w = options.winners;
                step = node.player.stage.step;

                // Set past earnings.
                node.game.money.update(options.bonus);

                // Make the past exhibition list.

                // On dissemination step, do 1 extra iteration and parse table.
                if (step === 4) {
                    i = -1, len = node.player.stage.round;
                    for ( ; ++i < len ; ) {
                        table = this.makeRoundTable(w[i], (i+1));
                    }
                    // Only when DOM is ready.
                    this.plot.tmpCache('cb', function() {
                        W.getElementById('container_exhibition')
                            .appendChild(table.parse());
                        node.events.step.emit('canvas_tooltip');
                    });
                }
                else {
                    i = -1, len = (node.player.stage.round-1);
                    for ( ; ++i < len ; ) {
                        table = this.makeRoundTable(w[i], (i+1));
                    }
                    // Evaluation.
                    if (step === 3) {
                        this.plot.tmpCache('reconReviews', options.reviews);
                    }
                }
            };
        }
    });

    stager.extendStep('submission', {
        init: function() {
            // Three arrays of submissions by exhibition.
            this.last_submissions = [[], [], []];
            memory.on('insert', this.assignSubToEx);
        },
        exit: function() {
            memory.off('insert', this.assignSubToEx);
        }
    });

    stager.extendStep('evaluation', {
        init: function() {
            this.last_reviews = {};
            this.reviewing = {};
        },
        cb: cbs.evaluation
    });

    stager.extendStep('dissemination', {
        init: function() {
            this.nextround_reviewers = [ [[], []], [[], []], [[], []] ];
        },
        cb: cbs.dissemination
    });

    stager.extendStage('final', {
        init: function() {
            var saveOptions;
            saveOptions = { flag: 'a' };

            // Save data.
            node.game.memory.save('artex_part2.json', saveOptions);

            // Write bonus file headers.
            cbs.appendToBonusFile();

            // Save Email.
            node.on.data('email', function(msg) {
                var id, code;
                id = msg.from;

                code = channel.registry.getClient(id);
                if (!code) {
                    console.log('ERROR: no code in endgame:', id);
                    return;
                }

                // Write bonus file headers.
                cbs.appendToEmailFile(msg.data, code);
            });
            // Compute payoff.
            node.on.data('WIN', function(msg) {
                var id, code, db, bonus, svoOwn, svoFrom;
                var totWin, totWinUsd, bonusStr;

                id = msg.from;

                code = channel.registry.getClient(id);
                if (!code) {
                    console.log('ERROR: no code in endgame:', id);
                    return;
                }

                channel.registry.checkOut(id);

                // Computing SVO bonus from other player.
                svoFrom = channel.registry
                    .getClient(node.game.svoMatches[id]).svo;

                if (svoFrom) {
                    svoFrom = svoFrom[1];
                }
                else {
                    console.log('WARN: svoFrom not found. ', msg.from);
                    svoFrom = 50;
                }
                code.svoFrom = svoFrom;

                svoOwn = code.svo;
                if (svoOwn) {
                    svoOwn = svoOwn[0];
                }
                else {
                    console.log('WARN: svoOwn not found. ', msg.from);
                    svoOwn = 100;
                }
                code.svoOwn = svoOwn;

                bonus = code.bonus || 0;

                // Send information.
                node.say('WIN', id, {
                    win: bonus,
                    exitcode: code.ExitCode,
                    svo: svoOwn,
                    svoFrom: svoFrom
                });

                // Saving last stage player data.
                db = node.game.memory.pquest[msg.from];
                if (db) {
                    // This should always exist, only when debugging.
                    db.save('artex_quest.json', saveOptions);
                }

                // Saving tot bonus for player.
                totWin = (bonus + svoOwn + svoFrom);
                totWinUsd = totWin / settings.EXCHANGE_RATE;
                // By default Approve is marked."
                bonusStr = '"' + (code.id || code.AccessCode || 'NA') + '","' +
                    (code.ExitCode || code.id) + '","' +
                    (code.WorkerId || 'NA') + '","' +
                    (code.HITId || 'NA') + '","' +
                    (code.AssignmentId || 'NA') + '",' +
                    bonus + ',' + svoOwn  + ',' + svoFrom  + ',' +
                    totWin + ',' + Number(totWinUsd).toFixed(2) + ',"x",\n';
                cbs.appendToBonusFile(bonusStr);
                console.log('FINAL PAYOFF PER PLAYER');
                console.log('***********************');
                console.log(bonusStr);
                console.log();
            });
        },
        stepRule: 'SOLO'
    });

    // Here we group together the definition of the game logic.
    return {
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
