/**
 * # Game settings: Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var settings;
var pubRules;

pubRules = {

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

    rankSame: ', and awards their authors the <em>same</em> ' +
        'number of reward points',

    rankDifferent: ', and awards their authors a <em>different</em> ' +
        'number of reward points'

//    rankDifferent: 'Each exhibition displays a <em>limited</em> number ' +
//        'of paintings, and awards their authors a <em>different</em> ' +
//        'number of points. That is: ' +
//        '<ul><li><strong>Exhibition A:</strong> ' +
//        'top <em id="ng_replace_threshold_A"></em> ' +
//        'painting/s and awards their authors ' +
//        '<em id="ng_replace_award_A"></em> points each</li>' +
//        '<li><strong>Exhibition B:</strong> ' +
//        'top <em id="ng_replace_threshold_B"></em> ' +
//        'painting/s and awards their authors ' +
//        '<em id="ng_replace_award_B"></em> points each</li>' +
//        '<li><strong>Exhibition C:</strong> ' +
//        'top <em id="ng_replace_threshold_C"></em> ' +
//        'painting/s and awards their authors ' +
//        '<em id="ng_replace_award_C"></em> points each</li>'


};

settings = {

    // Session Counter start from.
    SESSION_ID: 103,

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: '*',

    // Number of rounds to repeat the training.
    REPEAT_TRAINING: 1,

    // Number or rounds to draw images. *
    REPEAT: 12,

    // Number of coins to split. *
    COINS: 100,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 600,

    // DEBUG.
    DEBUG: true,

    // Wait time to reconnect (if updated update also text below).
    WAIT_TIME: 20,

    // Text displayed to players who are still connected.
    WAIT_TIME_TEXT: 'One or more players disconnected. If they ' +
        'do not reconnect within <span id="ng_pause_timer">20</span>' +
        ' seconds the game will continue with less players. <br/> Notice: ' +
        'players who do not reconnect at this point, may still re-join ' +
        'the game later.',

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
        instr_summary: 30000,
        // instructions: 90000,
        // quiz: 60000,
//         creation: function() {
//             var gs;
//             gs = this.getCurrentGameStage();
//             if (gs.round < 2) return 80000;
//             if (gs.round < 3) return 60000;
//             return 50000;
//         },
        creation: 50000,
        submission: 20000,
        evaluation: function() {
            var gs;
            gs = this.getCurrentGameStage();
            return gs.round < 2 ? 40000 : 20000;
        },
        dissemination: 15000
        // questionnaire: 20000
    },

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {

        rank_skew: {
            description: "Different number of awards and rewards",
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
            instrPage: 'instr_general.html',
            review_random: true,
            com: true
        },

        rank_same: {
            description: "Exactly same rewards for all exhibitions",
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
            instrPage: 'instr_general.html',
            review_random: true,
            com: true
        },

//         review_select_com: {
//             fullName: "Competitive Select Reviewer",
//             description:
//                 "Competition.",
//             review_select: true,
//             com: true,
//             instrPage: 'instructions_SEL_COM.html',
//             payoff: 3
//         },
//
//         review_select_coo: {
//             fullName: "Non-Competitive Select Reviewer",
//             description:
//                 "No competition.",
//             review_select: true,
//             com: false,
//             instrPage: 'instructions_SEL_COO.html',
//             payoff: 2
//         },
//
//         review_random_com: {
//             fullName: "Competitive Random Reviewer",
//             description:
//                 "Competition.",
//             review_random: true,
//             com: true,
//             instrPage: 'instructions_RND_COM.html',
//             payoff: 3
//         },
//
//         review_random_coo: {
//             fullName: "Non-Competitive Random Reviewer",
//             description:
//                 "No competition.",
//             review_random: true,
//             com: false,
//             instrPage: 'instructions_RND_COO.html',
//             payoff: 2
//         }

     }

};


module.exports = settings;
