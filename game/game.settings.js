/**
 * # Game settings: Art Exhibition Game
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

let pubRules = {

    thresholdCoo: ' and awards their authors the <em>same</em> ' +
        'number of reward points',

    thresholdCom: ' and awards their authors a <em>variable</em> ' +
        'number of reward points',

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
    REPEAT: 3,

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

    // Number of fixed points.
    fixedFee: 100,

    // competition: 'threshold' or 'tournament'.
    //   - 'threshold' will publish all images with average review > threshold
    //   - 'tournament' will rank all images by average review score and
    //   -    will publish the first N (can be different by exhibition).

    competition: 'tournament',

    exA: {
        competition: 'tournament',
        threshold : 0,
        N: 1,
        reward: 500
    },

    exB: {
        competition: 'tournament',
        threshold : 0,
        N: 2,
        reward: 250
    },

    exC: {
        competition: 'tournament',
        threshold : 0,
        N: 4,
        reward: 125
    },

    // Timer values.
    TIMER: {

        training: 60000,
        instr_summary: 60000,
        quiz: 60000,
        // Variable timer, more time in earlier rounds.
        // creation: function() {
        //     var round;
        //     round = this.getRound();
        //     if (round < 2) return 80000;
        //     if (round < 3) return 60000;
        //     return 50000;
        // },
        creation: 50000,
        submission: 2000000,
        evaluation: function() {
            var round;
            round = this.getRound();
            return round < 2 ? 40000 : 20000;
        },
        dissemination: 15000
        // questionnaire: 20000
    },

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {

        // Treatments from:

        // Balietti, S. and Riedl C. (2021) "Incentives, Competition, and
        // Inequality In markets for Creative Production"
        // Research Policy Volume 50, Issue 4


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
            review_random: true,
            com: true
        },

        // Treatments from:

        // Balietti, S., Goldstone, R.L., and Helbing, D. (2016)
        // "Peer Review and Competition in the Art Exhibition Game
        // Proceedings of the National Academy of Sciences (PNAS)
        // Volume 113, Number 30 8414-8419

        threshold_select_com: {
            description:
                "Threshold publishing, competitive, reviewers selected " +
                "from past submissions.",
            review_select: true,
            colors: true,
            com: true,
            competition: 'threshold',
            pubrule_text: pubRules.thresholdCom,
            payoff: 3,
            exA: {
                competition: 'threshold',
                reward: 250
            },

            exB: {
                competition: 'threshold',
                reward: 250
            },

            exC: {
                competition: 'threshold',
                reward: 250
            }
        },

        threshold_select_coo: {
            description:
                "Threshold publishing, non competitive, reviewers selected " +
                "from past submissions.",
            review_select: true,
            com: false,
            colors: true,
            competition: 'threshold',
            pubrule_text:  pubRules.thresholdCoo,
            payoff: 2,
            exA: {
                competition: 'threshold',
                reward: 250
            },

            exB: {
                competition: 'threshold',
                reward: 250
            },

            exC: {
                competition: 'threshold',
                reward: 250
            }
        },

        threshold_random_com: {
            description:
                "Threshold publishing, competitive.",
            review_random: true,
            com: true,
            colors: true,
            competition: 'threshold',
            pubrule_text:  pubRules.thresholdCom,
            exA: {
                competition: 'threshold',
                reward: 250
            },

            exB: {
                competition: 'threshold',
                reward: 250
            },

            exC: {
                competition: 'threshold',
                reward: 250
            }
        },

        threshold_random_coo: {
            description:
                "Threshold publishing, non competitive.",
            review_random: true,
            com: false,
            colors: true,
            competition: 'threshold',
            pubrule_text:  pubRules.thresholdCoo,
            exA: {
                competition: 'threshold',
                reward: 250
            },

            exB: {
                competition: 'threshold',
                reward: 250
            },

            exC: {
                competition: 'threshold',
                reward: 250
            }
        }

     }

};


module.exports = settings;
