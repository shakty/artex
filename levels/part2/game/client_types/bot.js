/**
 * # Bot code for Art Exhibition Game
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players automatically.
 *
 * http://www.nodegame.org
 */

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var ngc = require('nodegame-client');

    var game, stager;

    game = gameRoom.getClientType('player');

    game.env.auto = true;
    game.env.allowTimeup = false;
    game.env.allowDisconnect = false;

    game.nodename = 'bot';

    stager = ngc.getStager(game.plot);

    stager.extendAllSteps(function(o) {
        o.cb = function() {

            let id = node.game.getStepId();

            if (stepObj.id === 'submission') {
                node.game.last_ex =
                    node.game.settings.exhibitNames[node.JSUS.randomInt(-1, 2)];
            }

            

            // Not used for now.
            // // Allow disconnect and timeup.
            // if (node.env('allowDisconnect') && Math.random() < 0.5) {
            //     node.socket.disconnect();
            //     node.game.stop();
            //     node.timer.random(4000).exec(function() {
            //         node.socket.reconnect();
            //     });
            // }
            // else {
            //     if (!node.env('allowTimeup') || Math.random() < 0.5) {
            //         node.timer.random(1500).done();
            //     }
            // }

        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
