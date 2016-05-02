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
    WAIT_TIME: 5,

    // Threshold for publication.
    threshold: -1,

    // Exhibition names.
    exhibitNames: ['A','B','C'],

    // Number of players in each group.
    nPlayers: 9,

    // competition: 'threshold' or 'tournament'.
    //   - 'threshold' will publish all images with average review > threshold
    //   - 'tournament' will rank all images by average review score and
    //   -    will publish the first N (can be different by exhibition).

    competition: 'tournament', 

    exA: {
        competition: 'tournament',
        threshold : -1,
        N: 1,
        reward: 500
    },

    exB: {
        competition: 'tournament',
        threshold : -1,
        N: 2,
        reward: 250
    },

    exC: {
        competition: 'tournament',
        threshold : -1,
        N: 4,
        reward: 125
    },


    // Timer values.
    timer: {

        instructions: 90000,
        quiz: 60000,
        creation: function() {
            return 3000;
            if (node.player.stage.round < 2) return 80000;
            if (node.player.stage.round < 3) return 60000;
            return 50000;
        },
        evaluation: 2000, // 20000,
        dissemination: 150000,
        questionnaire: 20000
    },

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {
        
        review_select_com: {
            fullName: "Competitive Select Reviewer",
            description:
                "Competition.",
            review_select: true,
            com: true,
            instrPage: 'instructions_SEL_COM.html',
            payoff: 3
        },

        review_select_coo: {
            fullName: "Non-Competitive Select Reviewer",
            description:
                "No competition.",
            review_select: true,
            com: false,
            instrPage: 'instructions_SEL_COO.html',
            payoff: 2
        },

        review_random_com: {
            fullName: "Competitive Random Reviewer",
            description:
                "Competition.",
            review_random: true,
            com: true,
            instrPage: 'instructions_RND_COM.html',
            payoff: 3
        },

        review_random_coo: {
            fullName: "Non-Competitive Random Reviewer",
            description:
                "No competition.",
            review_random: true,
            com: false,
            instrPage: 'instructions_RND_COO.html',
            payoff: 2
        }
    }

    // * =  If you change this, you need to update 
    // the instructions and quiz static files in public/
};
