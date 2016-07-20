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
            var _cb, stepObj;
            var q, i, len;

            stepObj = this.getCurrentStepObj();
            _cb = stepObj._cb;
            _cb.call(this);
            if (stepObj.id === 'submission') {
                node.game.last_ex =
                    node.game.settings.exhibitNames[node.JSUS.randomInt(-1, 2)];
            }
            else if (stepObj.id === 'questionnaire') {
                for (q in this.questionnaire) {
                    if (this.questionnaire.hasOwnProperty(q)) {
                        this.questionnaire[q].setValues();
                    }
                }

            }
            else if (stepObj.id === 'morequestions') {
                // Do more questions.
                W.getElementById('yes').click();
                // Do all subquestions in every question.
                i = -1, len = this.qNamesExtra.length;
                for ( ; ++i < len ; ) {
                    for (q in this.questionnaire[this.qShown]) {
                        if (this.questionnaire[this.qShown].hasOwnProperty(q)) {
                            this.questionnaire[this.qShown][q].setValues();
                        }
                    }
                    W.getElementById('onemore').click();
                }
            }

            node.timer.randomDone();

        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
