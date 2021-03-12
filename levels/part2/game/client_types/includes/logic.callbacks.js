/**
 * # Functions used by logic.
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

const ngc = require('nodegame-client');
const J = ngc.JSUS;
const fs = require('fs-extra');
const path = require('path');
const RMatcher = require('./rmatcher');

module.exports = {
    init: init,
    gameover: gameover,
    evaluation: evaluation,
    dissemination: dissemination,
    notEnoughPlayers: notEnoughPlayers,
    enoughPlayersAgain: enoughPlayersAgain,
    appendToBonusFile: appendToBonusFile,
    appendToEmailFile: appendToEmailFile
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;
// var counter = module.parent.exports.counter;

const CODE_FILE = path.join(gameRoom.dataDir, 'codes.json');
const BONUS_FILE = path.join(gameRoom.dataDir, 'bonus.csv');
const EMAIL_FILE = path.join(gameRoom.dataDir, 'email.csv')

function init() {

    var i, len;

    // Number of reviewers per image.
    this.reviewers = 3;

    // Exhibition names and their id.
    this.exhibitions = {
        A: 0,
        B: 1,
        C: 2
    };

    // Player ids.
    this.plids = node.game.pl.id.getAllKeys();

    // Since the number of players is odd, with the matcher one
    // player is matched with the bot. (and it is done for 9 rounds).
    // We just make a for loop and match players randomly with dupli
    //     var matcher;
    //     matcher = new ngc.Matcher();
    //     matcher.generateMatches('roundrobin', this.plids, { rounds: 1 });
    //     matcher.match();
    //     this.svoMatches = matcher.getMatchObject();

    this.svoMatches = {};

    i = -1, len = this.plids.length;
    for ( ; ++i < len ; ) {
        this.svoMatches[this.plids[i]] =
            this.plids[J.randomInt(-1, this.plids.length)-1];
    }

    // Object containing the last works under review by player.
    this.reviewing = null;

    // Object containing the reviews received by every player.
    this.last_reviews = null;

    // Array containing the id the players
    // that have submitted to an exhibition.
    this.last_submissions = null;

    // In case the review assignment is not random,
    // but based on current round actions, this object contains them.
    this.nextround_reviewers = null;

    // Flag to check if the game was terminated abnormally.
    this.gameTerminated = 0;

    // List of all winners of all times (to send to reconnecting players).
    this.winners = new Array(settings.REPEAT);

    // Divide all objects of stage 'final' by player.
    this.memory.hash('pquest', function(o) {
        if (o.stage.stage > 2) return o.player;
    });

    // Keep last cf created by a subject.
    this.memory.index('cf', function(o) {
        if (o.cf || o.cf0) return o.player;
    });

    // Function used in submission step
    // for every newly inserted item in db.
    this.assignSubToEx = function(i) {
        var idEx, lastSub;
        idEx = node.game.exhibitions[i.ex];
        // Might be a reconnection/disconnection.
        if ('undefined' === typeof idEx) {
            console.log('submitted to undefined exhibition: ', i);
            return;
        }
        lastSub = node.game.last_submissions[idEx];
        // Might be a reconnection/disconnection.
        if (!lastSub) {
            console.log('exhibition not found: ' + idEx + ' From: ' + i.player);
            return;
        }
        lastSub.push({
            player: i.player,
            cf: node.game.memory.cf.get(i.player).cf
        });
    };

    // Saving the codes starting this session.
    node.game.pl.save(CODE_FILE);

//    fs.rename(CODE_FILE, CODE_FILE_BAK, function() {
//        node.game.pl.save(CODE_FILE, function() {
//        });
//    });

    // node.on('STEPPING', function() {
    //     console.log('----> minPlayers ', node.game.getProperty('minPlayers'));
    // });

    console.log('init');
}

function evaluation() {
    var that;
    var nReviewers, matches;
    var dataRound;

    that = this;

    nReviewers = this.pl.size() > 3 ?
        this.reviewers : this.pl.size() > 2 ? 2 : 1;

    dataRound = this.memory.stage[this.getPreviousStep()];

    node.env('review_random', function() {
        var submissions, sub, data, cf;
        var i, j;

        submissions = dataRound.fetch();
        // Generates a latin square array where:
        // - array-id of items to review,
        // - column are reviewers id.
        matches = J.latinSquareNoSelf(submissions.length, nReviewers);

        // Loop across reviewers.
        for (i = 0 ; i < submissions.length; i++) {
            data = { A: [], B: [], C: [] };
            // Loop across all items to review.
            for (j = 0 ; j < nReviewers ; j++) {
                // Get item to review.
                sub = submissions[matches[j][i]];
                cf = node.game.memory.cf.get(sub.player);
                cf = cf.cf || cf.cf0;

                if (!data[sub.ex]) {
                    console.log('exhibition not found. Data: ', data);
                    continue;
                }

                // Add it to an exhibition.
                data[sub.ex].push({
                    face: cf,
                    author: sub.player,
                    ex: sub.ex
                });
            }
            // Send them.
            node.say('CF', submissions[i].player, data);

            // Store reference to resend them in case of disconnection.
            node.game.reviewing[submissions[i].player] = data;
        }
    });

    node.env('review_select', function() {
        var pool, elements;
        var rm, matches, data;
        var i, j, h, face;

        // TODO: redo completely.

        pool = that.nextround_reviewers;
        elements = that.last_submissions;

        // First round.
        if (!pool) {
            pool = J.map(elements, function(ex) { return [ex]; });
        }

        rm = new RMatcher();
        rm.init(elements, pool);

        matches = rm.match();

        data = {};
        for (i = 0; i < elements.length; i++) {
            for (j = 0; j < elements[i].length; j++) {
                for (h = 0; h < matches[i][j].length; h++) {
                    face = dataRound
                        .select('player', '=', elements[i][j]).first();

                    if (!data[face.value]) data[face.value] = [];

                    data = {
                        face: face.CF.value,
                        author: face.player,
                        ex: face.value
                    };
                    node.say('CF', matches[i][j][h], data);
                }

            }

        }
    });

    // Build reviews index.
    node.on.data('done', function(msg) {
        var i, len, reviews, creator;
        if (!msg.data || !msg.data.reviews || !msg.data.reviews.length) {
            console.log('Error: no reviews received.', msg);
            return;
        }
        reviews = msg.data.reviews;
        // Loop through all the reviews of the subject,
        // and group them by item reviewed.
        i = -1, len = reviews.length;
        for ( ; ++i < len ; ) {
            creator = reviews[i].creator;
            if (!that.last_reviews[creator]) that.last_reviews[creator] = [];
            that.last_reviews[creator].push(reviews[i].eva);
        }
    });

    console.log('evaluation');
}

function dissemination() {
    var code;
    var ex, author, cf, mean, player, works;
    var nextRoundReviewer, player_result;
    var i, j, k, len;
    var nPubs, s;
    var round;

    // Array of all the selected works (by exhibition);
    var selected;
    // Results of the round (by author)
    var player_results, r;

    // Prepare result arrays.
    // Contains the selected images by exhibitions.
    selected = { A: [], B: [], C: [] };
    // Contains the individual result for every player.
    player_results = [];

    round = node.game.getRound();

    // Loop through exhibitions.
    for (i = 0; i < this.last_submissions.length; i++) {

        // Groups all the reviews for an artist.
        works = this.last_submissions[i];

        // Don't do more if there are no images submitted here.
        if (!works.length) continue;

        // Exhibition.
        ex = this.settings.exhibitNames[i];
        // Exhibition settings.
        s = settings['ex' + ex];

        // Collect all reviews and compute mean.
        for (j = 0; j < works.length; j++) {
            player = works[j].player;
            if (!this.last_reviews[player]) {
                node.err('No reviews for player: ' + player +
                         '. This should not happen. Some results are missing.');
                continue;
            }
            author = this.pl.id.get(player);
            if (!author) {
                node.warn('Author not found. Did somebody disconnected?');
                author = {};
            }

            // Compute average review score.
            mean = 0;
            k = -1, len = this.last_reviews[player].length;
            for ( ; ++k < len ; ) {
                mean += this.last_reviews[player][k]
            }
            mean = mean / this.last_reviews[player].length;

            // Cf.
            cf = works[j].cf;

            // Player is a submitter: second choice reviewer.
            nextRoundReviewer = 1;

            player_result = {
                player: player,
                author: author.name || player.substr(player.length -5),
                mean: Number(mean.toFixed(2)),
                ex: ex,
                round: round,
                cf: cf,
                id: author.name,
                payoff: 0 // will be updated later
            };

            if (s.competition === 'threshold') {
                // Threshold.
                if (mean > settings.threshold) {
                    // Mark that there is at least one winner.
                    selected.winners = true;

                    player_result.published = true;

                    selected[ex].push(player_result);

                    // Player will be first choice as a reviewer
                    // in exhibition i
                    nextRoundReviewer = 0;
                }
            }
            else {
                // Tournament. (push anyway).
                selected[ex].push(player_result);
            }

            // Add player to the list of next reviewers for the
            // exhibition where he submitted / published
            this.nextround_reviewers[i][nextRoundReviewer].push(player);

            // Add results for single player
            player_results.push(player_result);
        }

        if (s.competition === 'tournament') {
            selected.winners = true;
            selected[ex].sort(function(a, b) {
                if (a.mean > b.mean) return -1;
                if (b.mean > a.mean) return 1;
                return 0;
            });
            // Take only N winners per exhibition.
            selected[ex] = selected[ex].slice(0, s.N);
            j = -1, len = selected[ex].length;
            for ( ; ++j < len ; ) {
                selected[ex][j].published = true;
            }
        }
    }

    // Dispatch exhibition results to ROOM.
    node.say('WIN_CF', 'ROOM', selected);

    // Compute individual payoffs and send them to each player.
    i = -1, len = player_results.length;
    for ( ; ++i < len ; ) {
        r = player_results[i];

        if (r.published) {
            s = settings['ex' + r.ex];
            if (s.competition === 'threshold') {
                if (node.game.settings.com) {
                    nPubs = selected[r.ex].length;
                    r.payoff = (node.game.settings.payoff / nPubs).toFixed(2);
                }
                else {
                    r.payoff = node.game.settings.payoff;
                }
            }
            // 'tournament'
            else {
                r.payoff = s.reward;
            }
            // Update global payoff.
            code = channel.registry.getClient(r.player);
            code.bonus = code.bonus ? code.bonus + r.payoff : r.payoff;
        }
        else {
            // Remove data we do not need to send.
            r.cf = null;
        }
        node.say('PLAYER_RESULT', r.player, r);
    }

    // Keep track of all selected of all times (for recon purposes).
    round--;
    this.winners[round] = selected;

    console.log('dissemination');
}

function gameover() {
    console.log('************** GAMEOVER ' + gameRoom.name + ' **************');

    // Dump all memory.
    // node.game.memory.save(gameRoom.dataDir + 'memory_all.json');

    // TODO: fix this.
    // channel.destroyGameRoom(gameRoom.name);
}

function notEnoughPlayers() {
    var originalLen, len, minPlayersProp;
    var listenerName;

    listenerName = 'restoreMinPlayers';
    len = node.game.pl.size();
    originalLen = len + 1;
    minPlayersProp = node.game.getProperty('minPlayers');

    node.events.stage.on('in.say.PRECONNECT', function() {
        if (node.game.pl.size() === originalLen) {
            node.game.plot.updateProperty(node.player.stage,
                                          'minPlayers', minPlayersProp);
            node.game.sizeManager.minThreshold = originalLen;
            node.events.stage.off('in.say.PRECONNECT', listenerName);
        }
    }, listenerName);

    // Remove listener after first disconnection.
    node.game.sizeManager.clear();
    node.game.plot.updateProperty(node.player.stage, 'minPlayers', null);
}


function enoughPlayersAgain() {
    console.log('Enough players again!');
}

// ## Helper functions.

/**
 * ### appendToBonusFile
 *
 * Appends a row to the bonus file (no checkings)
 *
 * @param {string} row Optional. The row to append, or undefined to add header
 */
function appendToBonusFile(row) {
    if ('undefined' === typeof row) {
        row = '"access","exit","WorkerId","hid","AssignmentId","points",' +
            '"svo.own","svo.from","points.total","bonus","Approve","Reject"\n';
    }
    fs.appendFile(BONUS_FILE, row, function(err) {
        if (err) {
            console.log(err);
            console.log(row);
        }
    });
}

/**
 * ### appendToEmail
 *
 * Appends a row to the email file (no checkings)
 *
 * @param {string} email The email
 * @param {object} code The client object from the registry
 */
function appendToEmailFile(email, code) {
    var row;
    row  = '"' + (code.id || code.AccessCode || 'NA') + '", "' +
        (code.workerId || 'NA') + '", "' + email + '"\n';

    fs.appendFile(EMAIL_FILE, row, function(err) {
        if (err) {
            console.log(err);
            console.log(row);
        }
    });
}
