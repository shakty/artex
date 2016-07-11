/**
 * # Logic code for Artex
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var J = ngc.JSUS;

// Variable registered outside of the export function
// are shared among all instances of game logics.
var counter = 0;

// Flag to not cache required files.
var nocache = true;

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID;

    // Import other functions used in the game.
    // Some objects are shared.
    var cbs = channel.require(__dirname + '/includes/logic.callbacks.js', {
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

    stager.extendStage('artex', {
        pushClients: true,
        minPlayers: [
            settings.MIN_PLAYERS,
            cbs.notEnoughPlayers,
            cbs.enoughPlayersAgain
        ]
    });

    stager.extendStep('submission', {
        init: function() {
            // Three arrays of submissions by exhibition.
            this.last_submissions = [[], [], []];
            this.memory.on('insert', this.assignSubToEx);
        },
        exit: function() {
            this.memory.off('insert', this.assignSubToEx);
        }
    });

    stager.extendStep('evaluation', {
        init: function() {
            this.last_reviews = {};           
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
            // Save data.
            node.game.memory.save(this.DUMP_DIR + 'artex_part2.json');
       
            // Compute payoff.
            node.on.data('WIN', function(msg) {
                var id, code, db, svoFrom;
                id = msg.from;

                code = channel.registry.getClient(id);
                if (!code) {
                    console.log('ERROR: no code in endgame:', id);
                    return;
                }

                channel.registry.checkOut(id);

                // Computing SVO bonus from other player.
                svoFrom = channel.registry
                    .getClient(node.game.svoMatches[id]).svo[1];

                node.say('WIN', id, {
                    win: code.bonus,
                    exitcode: code.ExitCode,
                    svo: code.svo[0],
                    svoFrom: svoFrom
                });

                db = node.game.memory.pquest[msg.from];
                db.save(this.DUMP_DIR + 'artex_quest.json');
            });
        },
        stepRule: 'SOLO'
    });

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
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
