/**
 * # Game setup
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(settings, stages) {
    
    var game = {};

    //auto: true = automatic run, auto: false = user input
    game.env = {
        auto: false,
        review_select: !!settings.review_select,
        review_random: !!settings.review_random,
        com: !!settings.com,
        coo: !!settings.coo
    };

    game.debug = settings.DEBUG;

    game.verbosity = 0;

    game.window = {
        promptOnleave: !game.debug,
        disableRightClick: false
    }

    return game;
};
