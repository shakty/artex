/**
 * # Player code for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
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
        cb: cbs.instructions,
        minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
        timer: 90000
    });

    stager.extendStep('quiz', {
        cb: cbs.quiz,
        minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
        // `timer` starts automatically the timer managed by the widget
        // VisualTimer if the widget is loaded. When the time is up it fires
        // the DONE event.
        // It accepts as parameter:
        //  - a number (in milliseconds),
        //  - an object containing properties _milliseconds_, and _timeup_
        //     the latter being the name of the event to fire (default DONE)
        // - or a function returning the number of milliseconds.
        timer: 60000,
        done: function() {
            var b, QUIZ, answers, isTimeup;
            QUIZ = W.getFrameWindow().QUIZ;
            b = W.getElementById('submitQuiz');

            answers = QUIZ.checkAnswers(b);
            isTimeup = node.game.timer.isTimeup();

            if (!answers.__correct__ && !isTimeup) {
                return false;
            }

            answers.timeUp = isTimeup;
            answers.quiz = true;

            // On TimeUp there are no answers
            node.set(answers);
            node.emit('INPUT_DISABLE');
            
            return true;
        }
    });

    stager.extendStep('creation', {
        cb: cbs.creation
    });
    
    stager.extendStep('evaluation', {
        cb: cbs.evaluation
    });
    
    stager.extendStep('dissemination', {
        cb: cbs.dissemination
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
            var q1, q2, q2checked, i, isTimeup;
            q1 = W.getElementById('comment').value;
            q2 = W.getElementById('disconnect_form');
            q2checked = -1;

            for (i = 0; i < q2.length; i++) {
                if (q2[i].checked) {
                    q2checked = i;
                    break;
                }
            }

            isTimeup = node.game.timer.isTimeup();

            // If there is still some time left, let's ask the player
            // to complete at least the second question.
            if (q2checked === -1 && !isTimeup) {
                alert('Please answer Question 2');
                return false;
            }

            node.set({
                questionnaire: true,
                q1: q1 || '',
                q2: q2checked
            });

            node.emit('INPUT_DISABLE');

            return true;
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
