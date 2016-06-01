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

    // stager.setDefaultProperty('done', cbs.clearFrame);

    stager.setDefaultProperty('timeup', function() { node.done(); });

    stager.extendStep('consent', {
        frame: 'consent.html',
        donebutton: false,
    });

    stager.extendStep('intro', {
        frame: 'intro.html'
    });

    stager.extendStep('mood', {
        init: function() {
            this.mood = node.widgets.get('MoodGauge', {
                title: false
            });
        },
        frame: 'mood.html',
        done: function() {
            var values;
            values = this.mood.getValues({ 
                markAttempt: true,
                highlight: true
            });
            if (values.missValues) {
                // Do something.
                return false;
            }
            return values.items;
        }
    });

    stager.extendStep('svo', {
        init: function() {
            this.svo = node.widgets.get('SVOGauge', {
                title: false,
                mainText: false
            });
        },
        frame: 'svo.html',
        done: function() {
            var values;
            values = this.svo.getValues({ highlight: true });
            if (values.missValues) {
                // Do something.
                return false;
            }
            return values.items;
        }
    });

    stager.extendStep('demographics', {
        init: function() {
            var w;
            w = node.widgets;
            this.demo = w.get('ChoiceManager', {
                id: 'demo',
                title: false,
                shuffleForms: true,
                forms: [
                    w.get('ChoiceTable', {
                        id: 'age',
                        mainText: 'Report your age group',
                        choices: [
                            '18-20', '21-30', '31-40', '41-50',
                            '51-60', '61-70', '71+', 'Do not want to say'
                        ],
                        title: false,
                        requiredChoice: true
                    }),
                    w.get('ChoiceTable', {
                        id: 'job',
                        mainText: 'Does your current occupation involves ' +
                            'regular use of artistic or creative skills? ' +
                            'If so, please report your level of experience ' +
                            'in years.',
                        choices: [
                            'No', 'Yes, 1y', 'Yes, 1-2y',
                            'Yes, 3-5y','Yes, 5y+', 'Do not want to say'
                        ],
                        title: false,
                        requiredChoice: true
                    }),
                    w.get('ChoiceTable', {
                        id: 'gender',
                        mainText: 'Report your gender',
                        choices: [
                            'Male', 'Female', 'Other', 'Do not want to say'
                        ],
                        shuffleChoices: true,
                        title: false,
                        requiredChoice: true
                    })
                ]
            });
        },
        frame: 'demo.html',
        done: function() {
            var values;
            values = this.demo.getValues({ highlight: true });
            if (values.missValues.length) {
                // Do something.
                return false;
            }
            return values.items;
        }
    });

    stager.extendStep('instr_text', {
        frame: settings.instrPage
    });

    stager.extendStep('instr_images', {
        frame: 'instr_images.html'
    });

    stager.extendStep('quiz', {
        frame: 'quiz.html',
        donebutton: { text: 'Check Quiz!' },
        done: function() {
            var i, len, answers, values, text, spanOutcome, fail, correct;
            fail = '<em>Try again!</em>';
            correct = '<em>Correct!</em>';
            answers = [];
            i = -1, len = this.quizzes.length;
            for ( ; ++i < len ; ) {
                spanOutcome = W.getElementById('q_' + (i+1) + '_outcome');
                values = this.quizzes[i].getValues();
                if (!values.isCorrect) {
                    this.quizzes[i].highlight();
                    spanOutcome.innerHTML = fail;
                }
                else {
                    answers.push(values);
                    spanOutcome.innerHTML = correct;
                }
            }
            text = 'Check Quiz! Correct: ' + answers.length + ' / ' + len;
            this.node.game.donebutton.setText(text);
            if ((answers.length === len) || node.game.timer.isTimeup()) {
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

    stager.extendStep('training_intro', {
        frame: 'training_intro.html'
    });

    stager.extendStep('training', {
        init: function() {
            node.game.training = [];
        },
        frame: 'training.html',
        cb: function() {
            // var cb;
            var round;
            round = node.player.stage.round;
            W.setInnerHTML('drawing-count', round);
            //cb = function() { W.setInnerHTML('drawing-count', round); };
            // Load frame only on first round.
            // if (round !== 1) cb();
            //else W.loadFrame('training.html', cb);
        },
        done: function() {
            node.game.last_cf = node.game.cf.getValues();
        },
        exit: function() {
            node.game.visualTimer.setToZero();
        }
    });

   stager.extendStep('belief', {
        init: function() {
            this.belief = node.widgets.get('ChoiceTable', {
                id: 'belief',
                title: false,
                choices: [
                    '9<sup>th</sup>', '8<sup>th</sup>', '7<sup>th</sup>',
                    '6<sup>th</sup>', '5<sup>th</sup>', '4<sup>th</sup>',
                    '3<sup>rd</sup>', '2<sup>nd</sup>', '1<sup>st</sup>'
                ]
            });
        },
        frame: 'belief.html',
        done: function() {
            var values;
            values = this.belief.getValues({ highlight: true });
            if (values.choice === null) {
                // Do something.
                return false;
            }
            return values;
        }
    });

    stager.extendStep('finished_part1', {
        frame: 'finished_part1.html'
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
