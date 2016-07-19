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

    var channel = gameRoom.channel;
    var node = gameRoom.node;
    var ngc =  require('nodegame-client');

    var game, stager;

    game = gameRoom.getClientType('player');
    game.env.auto = true;
    game.nodename = 'autoplay';

    stager = ngc.getStager(game.plot);

    stager.extendAllSteps(function(o) {
        o._cb = o.cb;
        o.cb = function() {
            var i, len;
            var _cb, stepObj;
            stepObj = this.getCurrentStepObj();
            _cb = stepObj._cb;
            _cb.call(this);

            if (stepObj.id === 'mood') {
                this.mood.setValues();
            }
            else if (stepObj.id === 'svo') {
                this.svo.setValues();
            }
            else if (stepObj.id === 'demographics') {
                this.demo.setValues();
            }
            else if (stepObj.id === 'quiz') {
                i = -1, len = this.quizzes.length;
                for ( ; ++i < len ; ) {
                    this.quizzes[i].setValues({ correct: true });
                }
            }
            else if (stepObj.id === 'belief') {
                this.belief.setValues();
            }

            node.timer.randomDone();
        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
