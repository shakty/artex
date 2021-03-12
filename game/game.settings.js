/**
 * # Game settings: Art Exhibition Game
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

let pubRules = {

    thresholdSame: 'All the paintings that receive an average review-score ' +
        'greater than <em id="ng_replace_threshold"></em> are put on display ' +
        'in the exhibition to which they are submitted.',

    thresholdDifferent: 'Each exhibition has a different threshold. ' +
        'That is: ' +
        '<ul><li>Exhibition A: average review score &gt;' +
        '<em id="ng_replace_threshold_A"></em></li>' +
        '<li>Exhibition B: average review score &gt;' +
        '<em id="ng_replace_threshold_B"></em></li>' +
        '<li>Exhibition C: average review score &gt;' +
        '<em id="ng_replace_threshold_C"></em></li></ul>',

    rankSame: ' and awards their authors the <em>same</em> ' +
        'number of reward points',

    rankDifferent: ' and awards their authors a <em>different</em> ' +
        'number of reward points'

};

// Time for players to re-connect.
let wTime  = 20;

let settings = {

    // Session Counter start from.
    // SESSION_ID: 100,

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: '*',

    // Number of rounds to repeat the training.
    REPEAT_TRAINING: 1,

    // Number or rounds to draw images. *
    REPEAT: 9,

    // Number of coins to split. *
    COINS: 100,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 600,

    // DEBUG.
    DEBUG: true,

    // Time for players to re-connect.
    WAIT_TIME: wTime,

    // Text displayed to players who are still connected.
    WAIT_TIME_TEXT: 'One or more players disconnected. If they ' +
        'do not reconnect within <span id="ng_pause_timer">' + wTime +
        '</span>' +
        ' seconds the game will continue with less players. <br/> Notice: ' +
        'players who do not reconnect at this point, may still re-join ' +
        'the game later.',

    // Threshold for publication.
    threshold: -1,

    // Exhibition names.
    exhibitNames: ['A','B','C'],

    // Number of players in each group.
    nPlayers: 9,

    // If TRUE, players are assigned a color to begin with.
    colors: false,

    // competition: 'threshold' or 'tournament'.
    //   - 'threshold' will publish all images with average review > threshold
    //   - 'tournament' will rank all images by average review score and
    //   -    will publish the first N (can be different by exhibition).

    competition: 'tournament',

    exA: {
        competition: 'tournament',
        threshold : 1,
        N: 1,
        reward: 500
    },

    exB: {
        competition: 'tournament',
        threshold : 1,
        N: 2,
        reward: 250
    },

    exC: {
        competition: 'tournament',
        threshold : 1,
        N: 4,
        reward: 125
    },

    // Timer values.
    TIMER: {

        training: 60000,
        instr_summary: 400000,
        // instructions: 90000,
        // quiz: 60000,
//         creation: function() {
//             var gs;
//             gs = this.getCurrentGameStage();
//             if (gs.round < 2) return 80000;
//             if (gs.round < 3) return 60000;
//             return 50000;
//         },
        creation: 500000,
        submission: 200000,
        evaluation: function() {
            var gs;
            gs = this.getCurrentGameStage();
            return gs.round < 2 ? 400000 : 200000;
        },
        dissemination: 150000
        // questionnaire: 20000
    },

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {

        rank_skew: {
            description: "Rank tournament publishing, tiered market structure.",
            pubrule_text: pubRules.rankDifferent,
            exA: {
                competition: 'tournament',
                N: 1,
                reward: 500
            },

            exB: {
                competition: 'tournament',
                N: 2,
                reward: 250
            },

            exC: {
                competition: 'tournament',
                N: 4,
                reward: 125
            },
            colors: false,
            instrPage: 'instr_general.html',
            review_random: true,
            com: true
        },

        rank_same: {
            description: "Rank tournament publishing, flat market structure.",
            pubrule_text: pubRules.rankSame,
            exA: {
                competition: 'tournament',
                N: 2,
                reward: 250
            },

            exB: {
                competition: 'tournament',
                N: 2,
                reward: 250
            },

            exC: {
                competition: 'tournament',
                N: 2,
                reward: 250
            },
            colors: false,
            instrPage: 'instr_general.html',
            review_random: true,
            com: true
        },

        threshold_select_com: {
            description:
                "Threshold publishing, competitive, reviewers selected " +
                "based on history of publishing and submitting",
            review_select: true,
            colors: true,
            com: true,
            competition: 'threshold',
            instrPage: 'instructions_SEL_COM.html',
            pubrule_text: pubRules.rankDifferent,
            payoff: 3
        },

        threshold_select_coo: {
            description:
                "Threshold publishing, non competitive, reviewers selected " +
                "based on history of publishing and submitting",
            review_select: true,
            com: false,
            colors: true,
            competition: 'threshold',
            instrPage: 'instructions_SEL_COO.html',
            pubrule_text: pubRules.rankSame,
            payoff: 2
        },

        threshold_random_com: {
            description:
                "Threshold publishing, competitive.",
            review_random: true,
            com: true,
            colors: true,
            competition: 'threshold',
            instrPage: 'instructions_RND_COM.html',
            pubrule_text: pubRules.rankDifferent,
            payoff: 3
        },

        threshold_random_coo: {
            description:
                "Threshold publishing, non competitive.",
            review_random: true,
            com: false,
            colors: true,
            competition: 'threshold',
            instrPage: 'instructions_RND_COO.html',
            pubrule_text: pubRules.rankSame,
            payoff: 2
        }

     }

};


module.exports = settings;
