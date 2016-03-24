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
        auto: false
    };

    game.debug = true;

    game.verbosity = 1;

    game.window = {
        promptOnleave: !game.debug,
        disableRightClick: false
    }

    return game;
};
