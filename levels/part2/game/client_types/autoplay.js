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
    game.env.allowTimeup = false;
    game.env.allowDisconnect = false;

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

            if (stepObj.id === 'morequestions') {
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
                            node.JSUS.randomString(90, 'Aa1_9');
                        node.timer.randomExec(function() {
                            W.getElementById('onemore').click();
                            node.emit('moreq');
                        });
                        if (!this.qAvailable.length) this.finishedQ = true;
                    }
                    else {
                        W.getElementById('freecomment_text').value =
                            node.JSUS.randomString(150, 'Aa1_9');
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
                W.getElementById('email').value =
                    node.JSUS.randomString(9, 'a') + '@' + 'a.com';
                W.getElementById('submit-email').click();
                node.timer.randomExec(function() {
                    // Kill phantoms in test mode.
                    console.log('PHANTOMJS EXITING');
                });
                return;
            }

            else if (stepObj.id === 'submission') {
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

            // Allow disconnect and timeup.
            if (node.env('allowDisconnect') && Math.random() < 0.5) {
                node.socket.disconnect();
                node.game.stop();
                node.timer.randomExec(function() {
                    node.socket.reconnect();
                }, 4000);
            }
            else {
                if (!node.env('allowTimeup') || Math.random() < 0.5) {
                    node.timer.randomDone();
                }
            }

        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
