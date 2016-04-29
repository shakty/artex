/**
 * # Stages of the Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {

    stager
        .next('instructions')
        .next('quiz')
        .repeat('artex', settings.REPEAT)
        .next('final')
        .gameover();
        
    stager.extendStage('artex', {
        steps: [
            'creation',
            'submission',
            'evaluation',
            'dissemination'
        ]
    });

    stager.extendStage('final', {
        steps: [
            'questionnaire',
            'morequestions',
            'endgame'
        ]
    });

    stager.skip('instructions');
    stager.skip('quiz');
    stager.skip('artex');
    // stager.skip('artex', 'creation');
    // stager.skip('artex', 'evaluation');
    // stager.skip('artex', 'dissemination');
    stager.skip('final', 'questionnaire')
};
