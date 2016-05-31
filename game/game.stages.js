/**
 * # Stages of the Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {

    stager

        .next('consent')
        .next('intro')

    // individual part

        .next('mood')
        .next('svo')
        .next('demographics')
        .next('instructions')
        .next('quiz')
        .next('training_intro')
        .repeat('training', 3)
        .next('belief')   
        .next('finished_part1')

        .repeat('artex', settings.REPEAT)
        .next('final')

        .gameover();
       
    stager.extendStage('instructions', {
        steps: [
            'instr_text',
            'instr_images',
        ]
    });
 
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

//    stager.skip('mood');
//    stager.skip('svo');
//    stager.skip('demographics');
//    stager.skip('instructions');
//    stager.skip('quiz');
//    stager.skip('training');
//    stager.skip('belief');


//     stager.skip('artex');
//     stager.skip('artex', 'creation');
//     stager.skip('artex', 'evaluation');
//     stager.skip('artex', 'dissemination');
    
    // stager.skip('final', 'questionnaire')
    // stager.skip('final', 'morequestions')

};
