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
                node.on('moreq', function() {
                    var q, subq;
                    if (!this.finishedQ) {
                        q = this.questionnaire[this.qShown];
                        for (subq in q) {
                            if (q.hasOwnProperty(subq)) {
                                q[subq].setValues();
                            }
                        }
                        W.getElementById(this.qShown + '_text').value =
                            node.JSUS.randomString(90, 'Aa1_6');
                        node.timer.randomExec(function() {
                            W.getElementById('onemore').click();
                            node.emit('moreq');
                        });
                        if (!this.qAvailable.length) this.finishedQ = true;
                    }
                    else {
                        W.getElementById('freecomment_text').value =
                            node.JSUS.randomString(150, 'Aa1_6');
                        node.timer.randomDone();
                    }
                });
                // Do more questions.
                W.getElementById('yes').click();
                node.emit('moreq');
                return;
            }
            else if (stepObj.id === 'endgame') {
                // Nothing to do here.
                return;
            }

            node.timer.randomDone();

        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
