/**
 * # Game setup
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(settings, stages) {

    let game = {};

    game.debug = settings.DEBUG;

    game.verbosity = -1;

    game.window = {
        promptOnleave: !game.debug,
        disableRightClick: false,
        disableBackButton: true
    }

    return game;
};
