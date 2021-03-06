/**
 * # Functions used player clients in the Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    init: init,
    submission: submission,
    dissemination: dissemination
};

function init() {
    var header;

    this.node.log('Init.');

    // Setup the header.

    header = W.generateHeader();

    // Uncomment to visualize the name of the stages.
    //node.game.visualStage = node.widgets.append('VisualStage', header);

    node.game.visualTimer = node.widgets.append('VisualTimer', header);

    node.game.rounds = node.widgets.append('VisualRound', header, {
        displayModeNames: [ 'COUNT_UP_STAGES_TO_TOTAL' ]
    });

    node.game.money = node.widgets.append('MoneyTalks', header, {
        currency: '', title: 'Points:', precision: 1
    });

    node.game.doneButton = node.widgets.append('DoneButton', header, {
        text: 'Continue'
    });

    // Add the main frame where the pages will be loaded.
    W.generateFrame();

    // Holds references to copied images in current round.
    // Gets cleared every step.
    this.copies = [];

    // Reference to the main drawing ChernoffFaces widget
    this.cf = null;

    // Reference to the values of the last created Chernoff face.
    this.last_cf = null;

    // Exhibition names and total number.
    this.exhibitNames = this.settings.exhibitNames;
    this.nExhibits = this.exhibitNames.length;

    // Indexes of what sliders displaying past images by exhibition.
    this.subSliders = { A: 0, B: 0, C: 0 };

    // Winners.
    this.winners = { A: [], B: [], C: [] };

    // Exhibitions random review order.
    this.rndEvasOrder = [
        [ 'A', 'B', 'C' ],
        [ 'B', 'C', 'A' ],
        [ 'C', 'A', 'B' ],
        [ 'C', 'B', 'A' ],
        [ 'B', 'A', 'C' ],
        [ 'A', 'C', 'B' ]
    ];

    // Default color.
    // @see listener MYCOLOR.
    this.mycolor = 'black';

    // Questionnaire data.
    this.questionnaire = {};

    this.submissionMade = function(decision) {
        var td, otherTd, otherTd2;
        var tdButton, otherTdButton, otherTdButton2;

        if (decision === 'A') {
            td = W.getElementById('td-A');
            otherTd = W.getElementById('td-B');
            otherTd2 = W.getElementById('td-C');
            tdButton = W.getElementById('button-A');
            otherTdButton = W.getElementById('button-B');
            otherTdButton2 = W.getElementById('button-C');
        }
        else if (decision === 'B') {
            td = W.getElementById('td-B');
            otherTd = W.getElementById('td-A');
            otherTd2 = W.getElementById('td-C');
            tdButton = W.getElementById('button-B');
            otherTdButton = W.getElementById('button-A');
            otherTdButton2 = W.getElementById('button-C');
        }
        else if (decision === 'C') {
            td = W.getElementById('td-C');
            otherTd = W.getElementById('td-A');
            otherTd2 = W.getElementById('td-B');
            tdButton = W.getElementById('button-C');
            otherTdButton = W.getElementById('button-B');
            otherTdButton2 = W.getElementById('button-A');
        }
        else {
            node.err('unknown exhibition selected: ' + decision);
            return;
        }

        node.game.last_ex = decision;

        // Departure time is changed by the slider for car.
        JSUS.addClass(tdButton, 'active');
        JSUS.removeClass(otherTdButton, 'active');
        JSUS.removeClass(otherTdButton2, 'active');

        td.className = 'td-selected';
        otherTd.className = '';
        otherTd2.className = '';

        this.updateSubmissionButton();
    };

    this.updateSubmissionButton = function(decision) {
        var span;
        decision = decision || node.game.last_ex;
        if (decision) {
            span = W.getElementById('span-you-chose');
            span.innerHTML = ' (Your choice: <em>' + decision + '</em>)';
            node.game.doneButton.enable();
        }
    };

    // Quiz questions (to be filled by quiz stage).
    this.quizzes = [];

    // Current rounds of evalutions (review delivered by subject).
    // For each item it contains if the slider was moved, a reference
    // to the input containing the current value, and the exhibition.
    this.evas = {};

    // Names of the questionnaire forms ids (standard).
    this.qNames = [ 'enjoy', 'competitive', 'exbeau', 'exinn', 'exfair' ];

    // Names of the questionnaire forms ids (additional).
    this.qNamesExtra = [
        'creation', 'submission', 'review', 'copy',
        'specialization', 'ui', 'freecomment'
    ];

    // Names of the questionnaire forms ids (additional).
    this.qNamesExtraSubs = {
        creation: [
            {
                id: 'random',
                mainText: 'I was changing the images randomly'
            },
            {
                id: 'similar',
                mainText: 'I wanted to become more <em>similar</em> ' +
                    'to what I saw in the previous round/s'
            },
            {
                id: 'dissimilar',
                mainText: 'I wanted to become more ' +
                    '<em>dissimilar</em> from ' +
                    'what I saw in the previous round/s'
            },
            {
                id: 'sim_toex',
                mainText: 'I wanted to become more <em>similar</em> to ' +
                    'the images displayed in my target exhibition'
            },
            {
                id: 'dis_toex',
                mainText: 'I wanted to become more ' +
                    '<em>dissimilar</em> from the images ' +
                    'displayed in my target exhibition'
            }
        ],
        submission: [
            {
                id: 'random',
                mainText: 'I chose randomly'
            },
            {
                id: 'popular',
                mainText: 'I chose the exhibition that most ' +
                    'of the other participants were choosing as well'
            },
            {
                id: 'qualityup',
                mainText: 'I submitted the <em>most</em> beautiful ' +
                    'images to the <em>most</em> rewarding exhibitions ' +
                    '(A or B).'
            },
            {
                id: 'qualitydown',
                mainText: 'I submitted the <em>most</em> beautiful ' +
                    'images to the <em>least</em> rewarding exhibitions ' +
                    '(C or B).'
            },
            {
                id: 'innup',
                mainText: 'I submitted the <em>most</em> innovative ' +
                    'images to the <em>most</em> rewarding exhibitions ' +
                    '(A or B).'
            },
            {
                id: 'inndown',
                mainText: 'I submitted the <em>most</em> innovative ' +
                    'images to the <em>least</em> rewarding exhibitions ' +
                    '(C or B).'
            },
            {
                id: 'fit',
                mainText: 'I submitted to the exhibition where my ' +
                    'image would fit best in terms of style'
            },
            {
                id: 'reward',
                mainText: 'I chose the exhibition based on the expected reward'
            }
        ],
        review: [
            {
                id: 'byex',
                mainText: 'I was a stricter reviewer for images ' +
                    'submitted to A, a bit less for B, and even less for C'
            },
            {
                id: 'like',
                mainText: 'I gave higher scores to the images that ' +
                    'I liked the most'
            },
            {
                id: 'diverse',
                mainText: 'I gave higher scores to images that were more ' +
                    'innovative'
            },
            {
                id: 'fit',
                mainText: 'I gave higher scores to images that were fitting ' +
                    'the style of the exhibition'
            },
            {
                id: 'sameex',
                mainText: 'I gave lower scores to images submitted ' +
                    'to my same exhibition'
            },
            {
                id: 'sameexA',
                mainText: 'When I chose exhibition A, I gave lower ' +
                    'scores to images submitted to A'
            },
            {
                id: 'sameexB',
                mainText: 'When I chose exhibition B, I gave lower ' +
                    'scores to images submitted to B'
            },
            {
                id: 'sameexC',
                mainText: 'When I chose exhibition C, I gave lower ' +
                    'scores to images submitted to C'
            }
        ],
        copy: [
            {
                id: 'never',
                mainText: 'I seldom or never copied past images'
            },
            {
                id: 'liked',
                mainText: 'I copied because I liked an image ' +
                    'and I thought I that it could improve my style'
            },
            {
                id: 'win_similar',
                mainText: 'I copied because I thought that submitting a ' +
                    '<em>similar</em> image would increase my chances ' +
                    'of winning'
            },
            {
                id: 'savetime',
                mainText: 'I copied to save time to create something else'
            },
            {
                id: 'newideas',
                mainText: 'I copied when I was running out of new ideas'
            },
            {
                id: 'copy_old',
                mainText: 'I copied when I thought that bringing back an ' +
                    '<em>old</em> image would make me successful'
            }
        ],
        specialization: [
            {
                id: 'A',
                mainText: 'Exhibition A was very different from the others'
            },
            {
                id: 'B',
                mainText: 'Exhibition B was very different from the others'
            },
            {
                id: 'C',
                mainText: 'Exhibition C was very different from the others'
            },
            {
                id: 'same',
                mainText: 'I did not notice any significant difference ' +
                    'across exhibitions'
            }
        ],
        ui: [
            {
                id: 'easy',
                mainText: 'The interface to create images was immediately ' +
                    'easy to use'
            },
            {
                id: 'learning',
                mainText: 'The interface to create images was at a bit hard  ' +
                    'at the beginning, but I quickly learnt how to use it'
            },
            {
                id: 'more_options',
                mainText: 'I wished to have <em>more</em> options to ' +
                    'express my creativity'
            },
            {
                id: 'toomany_options',
                mainText: 'I wished to have <em>less</em> sliders to ' +
                    'create images'
            }
        ]
    };

   // All ids of questionnaire forms.
    this.qNamesAll = this.qNames.concat(this.qNamesExtra);

    // List of all past exhibitions.
    this.all_ex = new W.List({
        id: 'all_ex',
        lifo: true
    });

    // Renders a chernoff face (plus metadata) inside a table's cell.
    this.renderCF = function(cell) {
        var stepName, w, h;
        var cf, cfOptions;
        var container, cfDetailsTable;

        // Check if it is really CF obj (can be another cell, e.g. header).
        if (!cell.content || !cell.content.cf) return;

        stepName = node.game.getCurrentStepObj().id;

        // Adjust dimensions depending on the step.
        if (stepName === 'creation') {
            w = 100;
            h = 100;
        }
        else if (stepName === 'submission') {
            w = 50;
            h = 50;
        }
        else {
            w = 200;
            h = 200;
        }

        cfOptions = {
            width: w,
            height: h,
            features: cell.content.cf,
            controls: false,
            onChange: false,
            title: false
        };

        if (stepName !== 'submission') {

            // Creating HTML.
            container = document.createElement('div');
            cf = node.widgets.append('ChernoffFaces',
                                     container,
                                     cfOptions);

            cfDetailsTable = new W.Table();
            cfDetailsTable.addColumn([
                'Author: ' + cell.content.author,
                'Score: ' + cell.content.mean
            ]);
            container.appendChild(cfDetailsTable.parse());

            // Add listener on canvas.
            cf.getCanvas().onclick = function() {
                var data;
                data = cell.content;
                node.game.copies.push({
                    action: 'click',
                    time: node.timer.getTimeSince('step'),
                    author: data.author,
                    ex: data.ex,
                    mean: data.mean,
                    round: data.round,
                    rank: cell.y
                });
                node.game.popupCf.call(cf, stepName, data);
            };
            return container;
        }
        else {
            // Just canvas.
            cf = node.widgets.get('ChernoffFaces', cfOptions);
            cf.buildCanvas();
            return cf.getCanvas();
        }

    };

    this.popupCf = function(stepName, metadata) {
        var cf, cfOptions;
        var div, buttons, f;

        f = this.getValues();

        cfOptions = {
            width: 400,
            height: 400,
            features: f,
            controls: false,
            onChange: false,
            title: false
        };

        cf = node.widgets.get('ChernoffFaces', cfOptions);

        cf.buildCanvas();
        $(cf.canvas).css('background', 'white');
        $(cf.canvas).css('border', '3px solid #CCC');
        $(cf.canvas).css('padding', '5px');

        div = $('<div class="copyorclose">');
        div.append(cf.getCanvas());

        // If we are not in dissemination we can copy the image.
        if (stepName !== 'dissemination') {
            buttons = new Array(2);
            buttons[0] = {
                text: 'copy',
                click: function() {
                    // Triggers the update of the image and sliders.
                    node.emit('COPIED', f);
                    // Keep track of copying.
                    node.game.copies.push({
                        action: 'copied',
                        time: node.timer.getTimeSince('step'),
                        author: metadata.author,
                        round: metadata.round
                    });
                    $(this).dialog("close");
                }
            };
        }
        else {
            buttons = new Array(1);
        }

        buttons[buttons.length-1] = {
            text: 'Cancel',
            click: function() { $(this).dialog("close"); }
        };

        div.dialog({
            width: 480,
            height: 580,
            show: "blind",
            hide: "explode",
            buttons: buttons,
            dialogClass: 'noTitleStuff'
        });
    };

    this.addImagesToEx = function(ex) {
        var i, len, nTR, winners, container;
        var table, y, row, seeMore;

        var IMGS_4_ROW = 4;
        var ROWS_2_SHOW = 2;

        container = W.getElementById('ex-' + ex);
        winners = node.game.winners[ex];
        len = winners.length;
        if (!len) {
            W.getElementById('span-past-images-' + ex)
                .style.display = 'none';
            container.innerHTML = '<span class="noimages">' +
                'No past images yet</span>';
            return;
        }
        // Number of rows in the table.
        nTR = Math.floor(len / IMGS_4_ROW);
        if (len % IMGS_4_ROW !== 0) nTR++;

        // Pointer to last visible row (first row = last images).
        node.game.subSliders[ex] = ROWS_2_SHOW;

        table = new W.Table({
            className: 'exhibition',
            render: {
                pipeline: node.game.renderCF,
                returnAt: 'first'
            },
            id: 'tbl-ex-' + ex,
            tr: function(tr, row) {
                if ('number' !== typeof row) return;
                if (row >= ROWS_2_SHOW) tr.style.display = 'none';
            }
        });

        row = new Array(IMGS_4_ROW);
        i = -1, y = -1;
        for ( ; ++i < len ; ) {
            y = i % IMGS_4_ROW;
            row[y] = winners[i];
            if (y === (IMGS_4_ROW-1)) {
                table.addRow(row);
                row = new Array(IMGS_4_ROW);
            }
        }
        y = i % IMGS_4_ROW;
        if (y !== 0) table.addRow(row.splice(0, y));

        table.parse();
        container.appendChild(table.table);

        if (len > (IMGS_4_ROW * ROWS_2_SHOW)) {
            // Add last row to control visible rows (if needed).
            seeMore = document.createElement('button');
            seeMore.innerHTML = 'See more';
            seeMore.className = 'seemore btn btn-default';

            seeMore.onclick = (function(toShow) {
                return function() {
                    var idxShow, idxHide, trShow, trHide;

                    // Total count.
                    node.game.totClicksOnSubSliders[ex]++;

                    if (toShow) {
                        toShow.style.display = '';
                        toShow = null;
                    }

                    // Restarting modular index.
                    if (node.game.subSliders[ex] === 1) idxHide = nTR;
                    else idxHide = node.game.subSliders[ex]-1;

                    trHide = table.getTR((idxHide-1));

                    if (!trHide) {
                        console.log('Error... trHide not found.');
                        return;
                    }

                    trHide.style.display = 'none';

                    if (node.game.subSliders[ex] < nTR) {
                        node.game.subSliders[ex]++;
                    }
                    else {
                        node.game.subSliders[ex] = 1;
                    }

                    idxShow = node.game.subSliders[ex];
                    trShow = table.getTR((idxShow-1));

                    if (!trShow) {
                        console.log('Error... trShow not found.');
                        return;
                    }

                    // Do not show the first row,
                    // if we have reached the end.
                    if (node.game.subSliders[ex] !== 1) {
                        trShow.style.display = '';
                    }
                    else {
                        toShow = trShow;
                    }
                };
            })();
            container.appendChild(seeMore);
        }
    };

    this.makeRoundTable = (function() {

        function makeExColumn(table, ex, data) {
            var winners;
            if (!data.length) {
                table.addColumn([' - ']);
                return;
            }
            winners = data.sort(function(a, b) {
                if (a.mean > b.mean) return -1;
                if (b.mean > a.mean) return 1;
                return 0;
            });

            table.addColumn(winners);

            // Add to submission table.
            node.game.winners[ex] = winners.concat(node.game.winners[ex]);
        }

        return function(winners, round) {
            var dtHeader, table, str;

            round = round || node.player.stage.round;

            table = new W.Table({
                className: 'exhibition',
                render: {
                    pipeline: node.game.renderCF,
                    returnAt: 'first'
                }
            });
            table.setHeader(node.game.exhibitNames);

            dtHeader = 'Round: ' + round;
            this.all_ex.addDT(dtHeader);

            if (winners.winners) {
                makeExColumn(table, 'A', winners.A);
                makeExColumn(table, 'B', winners.B);
                makeExColumn(table, 'C', winners.C);
            }
            else {
                str = 'No painting was considered good enough ' +
                    'to be put on display.';
                // W.write(str, W.getElementById("container_exhibition"));
                this.all_ex.addDD(str);
            }

            this.all_ex.addDD(table);

            return table;
        };

    })();

    //////////////////////////////////////////////////////////////////////
    // Equal to part1. TODO: make one, maybe move in node core.
    //////////////////////////////////////////////////////////////////////
    var RECON_DELAY = 500;
    var MAX_RECON = 3;
    var disconnectCb = function() {
        // Cleanup.
        if (W.areLoading !== 0) W.areLoading = 0;

        // If still connected good!
        if (node.socket.isConnected()) {
            node.reconCounter = null;
            return;
        }

        // Otherwise destroy page and inform user.
        node.disconnectTimeout = null;
        W.restoreOnleave();
        W.clearPage();

        if (node.reconCounter === MAX_RECON) {
            alert('Too many disconnections in a short time. Please ' +
                  'check the following causes:\n' +
                  ' - Did you open other tabs to the same ' +
                  'experiment?\n' +
                  ' - Is your connection stable?\n' +
                  'Automatic reconnection disabled. Please close the ' +
                  'window and reopen it to reconnect.');
        }
        else {
            alert("Disconnection detected!\n\nClose this message and " +
                  "reload the page. You might need close " +
                  "the page and reopen it using the link in the " +
                  "task description.");
        }
        node.reconCounter = null;
    };

    node.on('SOCKET_DISCONNECT', function() {
        // Adding a property to node.
        if ('number' !== typeof node.reconCounter) {
            node.reconCounter = 1;
            setTimeout(function() { node.socket.reconnect(); }, RECON_DELAY);
        }
        else if (node.reconCounter < MAX_RECON) {
            node.reconCounter++;
            setTimeout(function() { node.socket.reconnect(); }, RECON_DELAY);

            if (node.disconnectTimeout) clearTimeout(node.disconnectTimeout);
            node.disconnectTimeout = setTimeout(disconnectCb, 4000);
        }
        else {
            clearTimeout(node.disconnectTimeout);
            disconnectCb();
        }
    });
    ///////////////////////////////////////////////////////////////////////////

    // Save the pcount so that it is diplayed in the instructions then.
    node.once.data('PCOUNT', function(msg) {
        node.game.pcount = msg.data;
        W.setInnerHTML('ng_replace_pcount', msg.data);
    });

    node.once.data('MYCOLOR', function(msg) {
        // console.log('MY COLOR IS ', msg.data);
        node.game.mycolor = msg.data;
    });
}

function submission() {
    var creaDiv, options;

    creaDiv = W.getElementById('creation');

    options = {
        width: 200,
        height: 200,
        features: node.game.last_cf,
        controls: false,
        onChange: false,
        title: false
    };

    node.widgets.append('ChernoffFaces', creaDiv, options);

    this.addImagesToEx('A');
    this.addImagesToEx('B');
    this.addImagesToEx('C');

    node.events.step.emit('canvas_tooltip');

    console.log('Submission');
}

function dissemination() {

    node.on.data('WIN_CF', function(msg) {
        var table;
        console.log('WWWWWWWWWIN_CF');
        if (!msg.data) {
            node.err('Error: No data received on WIN_CF.');
            return;
        }
        table = this.makeRoundTable(msg.data, node.player.stage.round);
        W.getElementById('container_exhibition').appendChild(table.parse());
        node.events.step.emit('canvas_tooltip');
    });

    node.on.data('PLAYER_RESULT', function(msg) {
        var str;
        if (!msg.data) return;
        // Create string.
        str = '';
        if (msg.data.published) {
            str += 'Congratulations! You published in exhibition: ';
            str += '<strong>' + msg.data.ex + '</strong>. ';
            str += 'You earned <strong>' + msg.data.payoff;
            str += ' points</strong>. ';
            node.game.money.update(parseFloat(msg.data.payoff, 10));
        }
        else {
            str += 'Sorry, you got rejected by exhibition: ' +
                '<strong>' + msg.data.ex + '</strong>. ';
        }
        str += 'Your average review score was: <strong>' +
            msg.data.mean + '</strong>.</br></br>';
        // Assign string.
        W.setInnerHTML('results', str);
    });

    console.log('Dissemination');
}
