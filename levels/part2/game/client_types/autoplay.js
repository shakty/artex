/**
 * # Autoplay code for Art Exhibition Game
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players automatically.
 *
 * http://www.nodegame.org
 */

module.exports = function(treatmentName, settings,
                          stagerPlayer, setup, gameRoom) {

    let node = gameRoom.node;
    let ngc =  require('nodegame-client');

    let game = gameRoom.getClientType('player');

    game.env.auto = true;
    game.env.allowTimeup = false;
    game.env.allowDisconnect = false;

    game.nodename = 'autoplay';

    let stager = ngc.getStager(game.plot);

    stager.extendAllSteps(function(o) {
        o._cb = o.cb;
        o.cb = function() {
            var _cb, stepObj;
            var q;

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
                        node.timer.random.exec(function() {
                            W.getElementById('onemore').click();
                            node.emit('moreq');
                        });
                        if (!this.qAvailable.length) this.finishedQ = true;
                    }
                    else {
                        W.getElementById('freecomment_text').value =
                            node.JSUS.randomString(150, 'Aa1_9');
                        node.timer.random.done();
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
                node.timer.random.exec(function() {
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
                node.timer.random(2000, 4000).exec(function() {
                    node.socket.reconnect();
                });
            }
            else {
                if (!node.env('allowTimeup') || Math.random() < 0.5) {
                    node.timer.random(1000, 2000).done();
                }
            }

        };
        return o;
    });

    game.plot = stager.getState();

    return game;
};
