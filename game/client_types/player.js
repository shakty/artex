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

    stager.setOnGameOver(function() {
        // Do something if you like!
    });

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
        }
    });

    // Adjust to displaying rounds in main stage.
    stager.extendStage('artex', {
        init: function() {
            node.game.rounds.setDisplayMode([
                // 'COUNT_UP_STAGES_TO_TOTAL',
                'COUNT_UP_ROUNDS_TO_TOTAL'
            ]);
            // Quiz might have changed.
            node.game.donebutton.setText('Click here when you are done!');
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
            $( ".copyorclose" ).dialog('close');
            $( ".copyorclose" ).dialog('destroy');
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

    stager.extendStep('questionnaire', {
        cb: cbs.questionnaire,
        timer: 90000,
        // `done` is a callback function that is executed as soon as a
        // _DONE_ event is emitted. It can perform clean-up operations (such
        // as disabling all the forms) and only if it returns true, the
        // client will enter the _DONE_ stage level, and the step rule
        // will be evaluated.
        done: function() {

            // TODO: do checkings, check if timeup.

            node.emit('INPUT_DISABLE');
        }
    });

    stager.extendStep('endgame', {
        cb: cbs.endgame
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



    game.verbosity = setup.verbosity;
    game.debug = setup.debug;

    game.nodename = 'player';

    return game;
};
