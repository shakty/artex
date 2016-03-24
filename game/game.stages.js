/**
 * # Stages of the Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {

    stager
        .next('instructions')
        .next('quiz')
        .repeat('artex', settings.REPEAT)
        .next('questionnaire')
        .next('endgame')
        .gameover();
        
        stager.extendStage('artex', {
            steps: [
                'creation',
                'evaluation',
                'dissemination'
            ]
        });
};
