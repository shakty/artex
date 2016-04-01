/**
 * # Functions used by logic.
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var GameStage = ngc.GameStage;
var J = ngc.JSUS;
var fs = require('fs');
var path = require('path');
var RMatcher = require('./rmatcher');

var DUMP_DIR;

module.exports = {
    init: init,
    gameover: gameover,
    instructions: instructions,
    quiz: quiz,
    creation: creation,
    evaluation: evaluation,
    dissemination: dissemination,
    questionnaire: questionnaire,
    endgame: endgame,
    notEnoughPlayers: notEnoughPlayers
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;
var counter = module.parent.exports.counter;


var client = gameRoom.getClientType('player');
var autoplay = gameRoom.getClientType('autoplay');


function init() {

    // Create data dir. TODO: do it automatically?
    DUMP_DIR = path.resolve(channel.getGameDir(), 'data') + '/' + counter + '/';
    J.mkdirSyncRecursive(DUMP_DIR, 0777);

    // Number of reviewers per image.
    this.reviewers = 3;

    // Exhibition names and their id.
    this.exhibitions = {
        A: 0,
        B: 1,
        C: 2
    };

    // Player ids.
    this.plids = [];

    // Object containing the reviews received by every player.
    this.last_reviews = null;

    // Array containing the id the players
    // that have submitted to an exhibition.
    this.last_submissions = null;

    // In case the review assignment is not random,
    // but based on current round actions, this object contains them.
    this.nextround_reviewers = null;

    // Decorate every object inserted in database with session and treatment.
    this.memory.on('insert', function(o) {
        o.session = node.nodename;
        o.treatment = gameRoom.treatmentName;
    });

    // Function used in creation step 
    // for every newly inserted item in db.
    this.assignSubToEx = function(i) {
        var idEx = node.game.exhibitions[i.ex];
        node.game.last_submissions[idEx].push({ player: i.player, cf: i.cf });
    };

    // Register player disconnection, and wait for him...
    node.on.pdisconnect(function(p) {
        console.log('Disconnection in Stage: ' + node.player.stage);
    });

    // Player reconnecting.
    // Reconnections must be handled by the game developer.
    node.on.preconnect(function(p) {
        var code;

        console.log('Oh...somebody reconnected!', p);
        code = channel.registry.getClient(p.id);

        // Delete countdown to terminate the game.
        clearTimeout(this.countdown);

        // Clear any message in the buffer from.
        node.remoteCommand('erase_buffer', 'ROOM');

        // Notify other player he is back.
        // TODO: add it automatically if we return TRUE? It must be done
        // both in the alias and the real event handler
        node.game.pl.each(function(player) {
            node.socket.send(node.msg.create({
                target: 'PCONNECT',
                data: {id: p.id},
                to: player.id
            }));
        });

        // Send currently connected players to reconnecting one.
        node.socket.send(node.msg.create({
            target: 'PLIST',
            data: node.game.pl.fetchSubObj('id'),
            to: p.id
        }));

        // We could slice the game plot, and send just what we need
        // however here we resend all the stages, and move their game plot.
        console.log('** Player reconnected: ' + p.id + ' **');
        // Setting metadata, settings, and plot.
        node.remoteSetup('game_metadata',  p.id, client.metadata);
        node.remoteSetup('game_settings', p.id, client.settings);
        node.remoteSetup('plot', p.id, client.plot);
        node.remoteSetup('env', p.id, client.env);


        // Start the game on the reconnecting client.
        // Need to give step: false, because otherwise pre-caching will
        // call done() on reconnecting stage.
        node.remoteCommand('start', p.id, { step: false } );

        // Pause the game on the reconnecting client, will be resumed later.
        // node.remoteCommand('pause', p.id);

        // It is not added automatically.
        // TODO: add it automatically if we return TRUE? It must be done
        // both in the alias and the real event handler.
        node.game.pl.add(p);

        // Will send all the players to current stage
        // (also those who were there already).
        node.game.gotoStep(node.player.stage);

        setTimeout(function() {
            // Pause the game on the reconnecting client, will be resumed later.
            // node.remoteCommand('pause', p.id);
            // Unpause ALL players
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            node.game.pl.each(function(player) {
                if (player.id !== p.id) {
                    node.remoteCommand('resume', player.id);
                }
            });
            // The logic is also reset to the same game stage.
        }, 100);
        // Unpause ALL players
        // node.remoteCommand('resume', 'ALL');
    });


    console.log('init');
}

function instructions() {
    node.game.plids = node.game.pl.keep('id').fetch();
    console.log('Instructions');
}

function gameover() {
    console.log('************** GAMEOVER ' + gameRoom.name + ' **************');

    // Dump all memory.
    node.game.memory.save(DUMP_DIR + 'memory_all.json');

    // TODO: fix this.
    // channel.destroyGameRoom(gameRoom.name);
}


function quiz() {
    console.log('Quiz');
}

function creation() {
    console.log('creation');
}

function evaluation() {
    var that;
    var nReviewers, matches;
    var dataRound;
    var curStep, prevStep;

    that = this;

    nReviewers = this.pl.size() > 3 ? 
        this.reviewers : this.pl.size() > 2 ? 2 : 1;

    
    curStep = this.getCurrentGameStage();
    prevStep = this.plot.previous(curStep);

    dataRound = this.memory.stage[prevStep];

    node.env('review_random', function() {
        var faces, face, data;
        var i, j;

        faces = dataRound.fetch();
        // Generates a latin square array where:
        // - array-id of items to review,
        // - column are reviewers id.
        matches = J.latinSquareNoSelf(faces.length, nReviewers);

        // Loop across reviewers.
        for (i = 0 ; i < faces.length; i++) {
            data = { A: [], B: [], C: []};
            // Loop across all items to review.
            for (j = 0 ; j < nReviewers ; j++) {
                // Get item to review.
                face = faces[matches[j][i]];
                // Add it to an exhibition.
                data[face.ex].push({
                    face: face.cf,
                    author: face.player,
                    ex: face.ex
                });
            }
            // Send them.            
            node.say('CF', faces[i].player, data);
        }
    });

    node.env('review_select', function() {
        var pool = that.nextround_reviewers;
        var elements = that.last_submissions;

        // First round.
        if (!pool) {
            pool = J.map(elements, function(ex) { return [ex]; });
        }

        var rm = new RMatcher();
        rm.init(elements, pool);

        var matches = rm.match();

        var data = {};
        for (var i = 0; i < elements.length; i++) {
            for (var j = 0; j < elements[i].length; j++) {

                for (var h = 0; h < matches[i][j].length; h++) {
                    var face = dataRound
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
    var exids = ['A', 'B', 'C'];
    var curStep = this.getCurrentGameStage();
    var submissionRound = this.plot.jump(curStep, -2);

    // Array of all the selected works (by exhibition);
    var selected = [];

    // Results of the round (by author)
    var player_results = [];

    var ex, author, cf, mean, player, works;
    var nextRoundReviewer, player_result;
    var subRound;
    var i, j, k, len;

    var idEx, nPubs;

    // Submission round data.
    subRound = this.memory.stage[submissionRound];

    for (i = 0; i < this.last_submissions.length; i++) {

        // Groups all the reviews for an artist.
        works = this.last_submissions[i];
        // Exhibition.
        ex = exids[i];

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
                node.err('No author found. This should not happen. ' +
                         'Some results are missing.');
                continue;
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
                mean: mean.toFixed(2),
                ex: ex,
                round: submissionRound,
                payoff: 0 // will be updated later
            };


            // Threshold.
            if (mean > settings.threshold) {

                J.mixin(player_result, {
                    cf: cf,
                    id: author.name,
                    round: node.game.getCurrentGameStage().toHash('S.r'),
                    pc: author.pc,
                    published: true
                });

                selected.push(player_result);

                // Player will be first choice as a reviewer
                // in exhibition i
                nextRoundReviewer = 0;
            }

            // Add player to the list of next reviewers for the
            // exhibition where he submitted / published
            this.nextround_reviewers[i][nextRoundReviewer].push(player);

            // Add results for single player
            player_results.push(player_result);
        }
    }

    // Dispatch exhibition results to ALL.
    node.say('WIN_CF', 'ALL', selected);

    
    // Compute individual payoffs and send them to each player.
    i = -1, len = player_results.length;
    for ( ; ++i < len ; ) {
        r = player_results[i];

        if (r.published) {
            if (node.game.settings.com) {
                idEx = node.game.exhibitions[r.ex];
                nPubs = node.game.nextround_reviewers[idEx][0].length;
                r.payoff = (node.game.settings.payoff / nPubs).toFixed(2);
            }            
            else {
                r.payoff = node.game.settings.payoff;            
            }
        }

        node.say('PLAYER_RESULT', r.player, r);
    }

    console.log('dissemination');
}

function questionnaire() {
    console.log('Postgame');
}

function notEnoughPlayers() {
    if (this.countdown) return;
    console.log('Warning: not enough players!!');
    this.countdown = setTimeout(function() {
        console.log('Countdown fired. Going to Step: questionnaire.');
        node.remoteCommand('erase_buffer', 'ROOM');
        node.remoteCommand('resume', 'ROOM');
        node.game.gameTerminated = true;
        // if syncStepping = false
        //node.remoteCommand('goto_step', 5);
        node.game.gotoStep('questionnaire');
    }, 30000);
}

function endgame() {
    var code, exitcode, accesscode;
    var filename, bonusFile, bonus;
    var EXCHANGE_RATE;

    EXCHANGE_RATE = settings.EXCHANGE_RATE_INSTRUCTIONS / settings.COINS;

    console.log('FINAL PAYOFF PER PLAYER');
    console.log('***********************');

    bonus = node.game.pl.map(function(p) {

        code = channel.registry.getClient(p.id);
        if (!code) {
            console.log('ERROR: no code in endgame:', p.id);
            return ['NA', 'NA'];
        }

        accesscode = code.AccessCode;
        exitcode = code.ExitCode;

        if (node.env('treatment') === 'pp' && node.game.gameTerminated) {
            code.win = 0;
        }
        else {
            code.win = Number((code.win || 0) * (EXCHANGE_RATE)).toFixed(2);
            code.win = parseFloat(code.win, 10);
        }
        channel.registry.checkOut(p.id);

        node.say('WIN', p.id, {
            win: code.win,
            exitcode: code.ExitCode
        });

        console.log(p.id, ': ',  code.win, code.ExitCode);
        return [p.id, code.ExitCode || 'na', code.win,
                node.game.gameTerminated];
    });

    console.log('***********************');
    console.log('Game ended');

    // Write down bonus file.
    filename = DUMP_DIR + 'bonus.csv';
    bonusFile = fs.createWriteStream(filename);
    bonusFile.on('error', function(err) {
        console.log('Error while saving bonus file: ', err);
    });
    bonusFile.write(["access", "exit", "bonus", "terminated"].join(', ') + '\n');
    bonus.forEach(function(v) {
        bonusFile.write(v.join(', ') + '\n');
    });
    bonusFile.end();

    // node.fs.writeCsv(bonusFile, bonus, {
    //     headers: ["access", "exit", "bonus", "terminated"]
    // });

    // TODO: do we need this? It triggers gameover.
    // node.done();
}