/**
 * # Autoplay code for Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players automatically.
 *
 * http://www.nodegame.org
 */

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var ngc =  require('nodegame-client');

    var game, stager;

    game = gameRoom.getClientType('player');

    game.env.auto = true;
    game.env.allowTimeup = false;
    game.env.allowDisconnect = false;

    game.nodename = 'autoplay';

    stager = ngc.getStager(game.plot);

    stager.extendAllSteps(function(o) {
        o._cb = o.cb;
        o.cb = function() {
            var i, len;
            var _cb, stepObj, id;
            stepObj = this.getCurrentStepObj();
            _cb = stepObj._cb;
            _cb.call(this);
            id = stepObj.id
            if (id === 'mood') {
                this.mood.setValues();
            }
            else if (id === 'svo') {
                this.svo.setValues();
            }
            else if (id === 'demographics') {
                this.demo.setValues();
            }
            else if (id === 'quiz') {
                i = -1, len = this.quizzes.length;
                for ( ; ++i < len ; ) {
                    this.quizzes[i].setValues({ correct: true });
                }
            }
            else if (id === 'belief') {
                this.belief.setValues();
            }

            if (node.env('allowDisconnect') && Math.random() < 0.5) {
                node.socket.disconnect();
                node.game.stop();
                node.timer.randomExec(function() {
                    node.socket.reconnect();
                }, 4000);
            }
            else {
                if (!node.env('allowTimeup') || Math.random() < 0.5) {
                    node.timer.randomDone(1500);
                }
            }
        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
