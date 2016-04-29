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

    stager.setDefaultProperty('done', cbs.clearFrame);

    stager.extendStep('instructions', {
        minPlayers: MIN_PLAYERS,
        timer: settings.timer.instructions,
//         frame: {
//             uri: settings.instrPage,
//             // loadMode: 'cache',
//             // storeMode: 'onLoad'
//             autoParse: true,
//         },
        frame: settings.instrPage
    });

    stager.extendStep('quiz', {
        frame: 'quiz.html',
        timer: settings.timer.quiz,
        donebutton: { text: 'Check Quiz!' },
        done: function() {
            var QUIZ, answers, isTimeup, text;
            QUIZ = W.getFrameWindow().QUIZ;
            answers = QUIZ.checkAnswers();
            text = 'Check Quiz! Correct: ' + answers.counterCorrect +
                ' / ' + answers.counterQuestions;
            this.node.game.donebutton.setText(text);
            if (answers.correct || node.game.timer.isTimeup()) {
                // On Timeup there are no answers.
                return answers;
            }
            else {
                return false;
            }
        },
        exit: function() {
            // Quiz might have changed.
            node.game.donebutton.setText('Click here when you are done!');
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
        timer: settings.timer.creation,
        done: function() {
            $(".copyorclose").dialog('close');
            $(".copyorclose").dialog('destroy');
            node.game.last_cf = node.game.cf.getAllValues();
        }
    });

    stager.extendStep('submission', {
        init: function() {
            this.subSliders = { A: 0, B: 0, C: 0 };
        },
        cb: cbs.submission,
        timer: settings.timer.submission,
        donebutton: false,
        done: function() {
            return {
                ex: node.game.last_ex,
                cf: node.game.last_cf,
                copies: node.game.copies
            };
        }
    });

    stager.extendStep('evaluation', {
        init: function() {
            // Reset evaluations.
            node.game.evas = {};
        },
        frame: 'evaluation.html',
        // cb: function() {
        //    W.loadFrame('evaluation.html');
        // },
        timer: settings.timer.evaluation,
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
                        hasChanged: !!eva.changed
                    });
                }
            }
            // Making it an object, so that is is sent as a single parameter.
            return { reviews: out };
        }
    });

    stager.extendStep('dissemination', {
        cb: cbs.dissemination,
        timer: settings.timer.dissemination,
        done: function() {
            $(".copyorclose").dialog('close');
            $(".copyorclose").dialog('destroy');
        }
    });

    stager.extendStage('final', {
        stepRule: 'SOLO'
    });

    stager.extendStep('questionnaire', {
        init: function() {
            var i, len;            
            i = -1, len = this.qNamesAll.length;
            for ( ; ++i < len ; ) {
                this.makeQuestion(this.qNamesAll[i]);
            }
        },
        frame: 'questionnaire.html',
        // timer: settings.timer.questionnaire,
        done: function() {
            var name, q, miss, out, i, len;
            out = {};
            q = this.questionnaire;
            i = -1, len = this.qNames.length;
            for ( ; ++i < len ; ) {                
                name = this.qNames[i];
                if (!q[name].currentAnswer) {
                    miss = true;
                    W.highlight(W.getElementById(name), 'ERR');
                }
                else if (!miss) {
                    out[name] = {
                        name: name,
                        value: q[name].currentAnswer,
                        numberOfClicks: q[name].numberOfClicks
                    };
                }
            }
            if (miss) {
                this.donebutton.setText('Answer all 5 questions');
                return false;
            }
            return out;
        },
        exit: function() {
            node.game.donebutton.setText('Click here when you are done!');
        }
    });

    stager.extendStep('morequestions', {
        init: function() {
            this.qAvailable = this.qNamesExtra
                .slice(0, this.qNamesExtra.length -1);
            this.qShown = null;

            this.showQuestion = function() {
                var idx;
                // Hide previous question.
                if (this.qShown) {

                    // TODO: set value.
                    // node.set();

                    W.hide(this.qShown);
                }
                if (this.qAvailable.length) {
                    idx = JSUS.randomInt(-1, (this.qAvailable -1));
                    // Save the id of available question,
                    // and remove it from array.
                    this.qShown = this.qAvailable.splice(idx, 1)[0];
                    // Show it.
                }
                else {
                    this.qShown = 'freecomment';
                    W.hide('moreornot');
                    W.show('lastquestion');
                    W.getElementById('done').onclick = function() {
                        node.done();
                    }
                }
                W.show(this.qShown);
            }
        },
        frame: 'morequestions.html',
        cb: function() {
            W.hide('h1title');
            W.getElementById('onemore').onclick = function() {
                node.game.showQuestion();
            };            
            W.getElementById('enough').onclick = function() {
                node.done();
            };
            this.showQuestion();
        },
        done: function() {
            // TODO.
        },
        donebutton: false
    });

    stager.extendStep('endgame', {
        frame: 'ended.html',
        donebutton: false
    });

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    // Other settings, optional.

    //auto: true = automatic run, auto: false = user input
    game.env = {
        auto: settings.AUTO,
        review_select: !!settings.review_select,
        review_random: !!settings.review_random,
        com: !!settings.com,
        coo: !!settings.coo
    };

    game.verbosity = 1000; // setup.verbosity;
    game.debug = setup.debug;
    game.events = { dumpEvents: true };

    game.nodename = 'player';

    return game;
};
