/**
 * # Player code for Artex Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game, MIN_PLAYERS;
    var cbs;

    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // The game object to return at the end of the function.
    game = {};

    // Import other functions used in the game.

    cbs = require(__dirname + '/includes/player.callbacks.js');

    // Specify init function, and extend default stages.

    // Init callback.
    stager.setOnInit(cbs.init);

    // Add all the stages into the stager.

    stager.setDefaultProperty('timeup', function() { node.done(); });

    stager.extendStep('instr_summary', {
        frame: 'instr_summary.html',
        donebutton: false,
        exit: function() {
            if (this.visualTimer) {
                this.visualTimer.gameTimer.removeHook('extraTimer');
            }
        }
    });

    // Adjust to displaying rounds in main stage.
    stager.extendStage('artex', {
        init: function() {
            node.game.rounds.setDisplayMode([
                // 'COUNT_UP_STAGES_TO_TOTAL',
                'COUNT_UP_ROUNDS_TO_TOTAL'
            ]);
        },
        exit: function() {
            node.game.rounds.setDisplayMode([ 'COUNT_UP_STAGES_TO_TOTAL' ]);
        }
    });

    stager.extendStep('creation', {
        init: function() {
            node.game.copies = [];
        },
        frame: 'creation.html',
        done: function() {
            var values;
            $(".copyorclose").dialog('close');
            $(".copyorclose").dialog('destroy');
            values = node.game.cf.getValues({ changes: true });
            node.game.last_cf = values.cf;
            return {
                cf: node.game.last_cf,
                changes: node.game.cf.changes,
                copies: node.game.copies
            };
        }
    });

    stager.extendStep('submission', {
        init: function() {
            this.subSliders = { A: 0, B: 0, C: 0 };
            this.totClicksOnSubSliders = { A: 0, B: 0, C: 0 };
        },
        cb: cbs.submission,
        donebutton: false,
        frame: 'submission.html',
        timeup: function() {
            var J, ex;
            J = this.node.JSUS;
            ex = this.last_ex || this.settings.exhibitNames[J.randomInt(-1,2)];
            this.submissionMade(ex);
            node.done();
        },
        done: function() {
            return {
                ex: node.game.last_ex,
                seeMore: node.game.totClicksOnSubSliders
            };
        }
    });

    stager.extendStep('evaluation', {
        init: function() {
            // Reset evaluations.
            this.evas = {};
            this.evasOrder = this.rndEvasOrder[this.node.JSUS.randomInt(-1, 5)];
        },
        frame: 'evaluation.html',
        done: function() {
            var i, out, eva;
            out = [];
            for (i in this.evas) {
                if (this.evas.hasOwnProperty(i)) {
                    eva = this.evas[i];
                    out.push({
                        creator: i,
                        ex: eva.ex,
                        eva: parseFloat(eva.display.value, 10),
                        hasChanged: !!eva.changed,
                        order: eva.order
                    });
                }
            }
            // Making it an object, so that is is sent as a single parameter.
            return { reviews: out };
        }
    });

    stager.extendStep('dissemination', {
        init: function() {
            node.game.copies = [];
        },
        frame: 'dissemination.html',
        cb: cbs.dissemination,
        done: function() {
            $(".copyorclose").dialog('close');
            $(".copyorclose").dialog('destroy');
            return { copies: node.game.copies };
        }
    });

    stager.extendStage('final', {
        stepRule: 'SOLO'
    });

    stager.extendStep('questionnaire', {
        frame: 'questionnaire.html',
        done: function() {
            var name, q, miss, out, i, len, values;
            out = {};
            q = this.questionnaire;
            i = -1, len = this.qNames.length;
            for ( ; ++i < len ; ) {
                name = this.qNames[i];
                values = q[name].getValues();
                if (!values.choice) {
                    miss = true;
                    q[name].highlight();
                }
                else if (!miss) {
                    out[name] = values;
                }
            }
            if (miss) {
                this.donebutton.setText('Answer all 5 questions');
                return false;
            }
            return out;
        },
        exit: function() {
            node.game.donebutton.setText('Continue');
        }
    });

    stager.extendStep('morequestions', {
        frame: 'morequestions.html',
        init: function() {
            this.qAvailable = this.qNamesExtra
                .slice(0, this.qNamesExtra.length -1);
            this.qShown = null;

            this.showQuestion = function() {
                var idx, q, len, title;
                var obj, i, fd;

                // Scroll up!
                fd = W.getFrameDocument();
                fd.body.scrollTop = 0;
                fd.documentElement.scrollTop = 0;

                // Num. of available questions, also used to assess
                // the order in which they are shown.
                len = this.qAvailable.length;

                // Hide previous question.
                if (this.qShown) {
                    q = node.game.questionnaire;
                    obj = {
                        name: this.qShown,
                        globalOrder: (this.qNamesExtra.length - len) - 1,
                    };
                    for (i in q[this.qShown]) {
                        if (q[this.qShown].hasOwnProperty(i)) {
                            obj[i] = q[this.qShown][i].getValues();
                        }
                    }

                    // Storing value in the server.
                    node.set(obj);

                    W.hide(this.qShown);
                }
                if (len) {
                    idx = JSUS.randomInt(-1, (len -1));
                    // Save the id of available question,
                    // and remove it from array.
                    this.qShown = this.qAvailable.splice(idx, 1)[0];
                }
                else {
                    this.qShown = 'freecomment';
                    W.hide('moreornot');
                    this.donebutton.enable();
                }

                title = W.getElementById(this.qShown + '_title').value;
                W.getElementById('h1title').innerHTML = title;
                // Show new question.
                W.show(this.qShown);
                // Set the timestamp to measure when users finish the page.
                node.timer.setTimestamp('question_loaded');
            };
        },
        cb: function() {
            W.getElementById('onemore').onclick = function() {
                node.game.showQuestion();
            };
            W.getElementById('enough').onclick = function() {
                node.done();
            };
            W.getElementById('yes').onclick = function() {
                W.hide('question');
                W.show('quiz');
                node.game.showQuestion();
            };
            W.getElementById('no').onclick = function() {
                node.done();
            };
        },
        done: function() {
            var name, q, out, values, subq, i, len;
            q = this.questionnaire;
            i = -1, len = this.qNamesExtra.length;
            out = new Array(len);
            for ( ; ++i < len ; ) {
                name = this.qNamesExtra[i];
                values = { _group: name };
                // All nested questions (freecomment does not have any).
                for (subq in q[name]) {
                    if (q[name].hasOwnProperty(subq)) {
                        values[subq] = q[name][subq].getValues();
                    }
                }
                // Free comment.
                values.freecomment = W.getElementById(name + '_text').value;
                // Store values.
                out[i] = values;
            }
            return out;
        },
        donebutton: false
    });

    stager.extendStep('endgame', {
        init: function() {
            node.game.visualTimer.setToZero();
            // Request data.
            node.say('WIN', 'SERVER');
            node.on.data('WIN', function(msg) {
                var win, exitcode, codeErr;
                var exitCodeInput, winInput, svoInput;
                var svo, svoFrom, totalSvo, totalWin, winUsd;
                // Exit Code.
                codeErr = 'ERROR (code not found)';
                exitcode = msg.data && msg.data.exitcode || codeErr;
                exitCodeInput = W.getElementById('exitCode');
                exitCodeInput.value = exitcode;
                // Svo.
                svoInput = W.getElementById('svo');
                totalSvo = msg.data.svo + msg.data.svoFrom;
                svoInput.value = msg.data.svo + ' + ' + msg.data.svoFrom +
                    ' = ' + totalSvo + ' Points';
                // Total win.
                win = msg.data && msg.data.win || 0;
                winInput = W.getElementById('win');
                totalWin = win + totalSvo;
                winUsd = totalWin / node.game.settings.EXCHANGE_RATE;
                winInput.value = win + ' + ' + totalSvo + ' = ' + totalWin +
                    ' Points = ' + Number(winUsd).toFixed(2) + ' USD';
            });
        },
        frame: 'ended.html',
        donebutton: false,
        cb: function() {
            var b, i, errStr, counter;
            counter = 0;
            b = W.getElementById('submit-email');
            i = W.getElementById('email');
            errStr = 'Check your email and click here again';
            b.onclick = function() {
                var email, indexAt, indexDot, err;
                email = i.value;
                if (email.trim().length > 5) {
                    indexAt = email.indexOf('@');
                    if (indexAt !== -1 &&
                        indexAt !== 0 &&
                        indexAt !== (email.length-1)) {
                        indexDot = email.lastIndexOf('.');
                        if (indexDot !== -1 &&
                            indexDot !== (email.length-1) &&
                            indexDot > (indexAt+1)) {

                            b.disabled = true;
                            i.disabled = true;
                            node.say('email', 'SERVER', email);
                            b.onclick = null;
                            b.innerHTML = 'Sent!';
                            return;
                        }
                    }
                }
                b.innerHTML = errStr;
                if (counter) b.innerHTML += '(' + counter + ')';
                counter++;
            };
            // Remove block from leaving page.
            W.restoreOnleave();
        }
    });

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    //auto: true = automatic run, auto: false = user input
    game.env = {
        auto: settings.AUTO,
        review_select: !!settings.review_select,
        review_random: !!settings.review_random,
        com: !!settings.com,
        coo: !!settings.coo
    };

    game.verbosity = setup.verbosity;
    game.debug = setup.debug;

    // Remove for live game.
    game.events = { dumpEvents: true };

    game.window = setup.window;

    game.nodename = 'player';

    return game;
};
