/**
 * # Stages of the Art Exhibition Game
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {


    stager
        .stage('intro')
        .stage('mood')
        .stage('svo')
        .stage('demographics')
        .stage('instructions')
        // .stage('quiz')
        .stage('training_intro')
        .repeat('training', settings.REPEAT_TRAINING)
        .stage('belief')
        .stage('finished_part1');


    stager.extendStage('instructions', {
        steps: [
            'instr_text',
            'instr_images',
        ]
    });

    stager.skip('intro');
    stager.skip('mood');
    stager.skip('svo');
    stager.skip('demographics');
    // stager.skip('instructions');
    // stager.skip('quiz');
    stager.skip('training_intro');
    stager.skip('training');
    stager.skip('belief');
    // stager.skip('finished_part1');

};
