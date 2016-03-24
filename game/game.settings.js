/**
 * # Game settings: Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {

    // Session Counter start from.
    SESSION_ID: 100,

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: 2,

    // Number or rounds to repeat the bidding. *
    REPEAT: 2,

    // Number of coins to split. *
    COINS: 100,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 4000,

    EXCHANGE_RATE_INSTRUCTIONS: 0.01,

    // DEBUG.
    DEBUG: true,

    // AUTO-PLAY.
    AUTO: false,

    // AUTHORIZATION.
    AUTH: 'NO', // MTURK, LOCAL, NO.

    // Wait time to reconnect.
    WAIT_TIME: 60,

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {
        
        review_select_com: {
            fullName: "Competitive Select Reviewer",
            description:
                "Competition.",
            review_select: true,
            com: true,
        },

        review_select_coo: {
            fullName: "Non-Competitive Select Reviewer",
            description:
                "No competition.",
            review_select: true,
            com: false,
        },

        review_random_com: {
            fullName: "Competitive Random Reviewer",
            description:
                "Competition.",
            review_random: true,
            com: true
        },

        review_random_coo: {
            fullName: "Non-Competitive Random Reviewer",
            description:
                "No competition.",
            review_random: true,
            com: false
        }
    }

    // * =  If you change this, you need to update 
    // the instructions and quiz static files in public/
};
