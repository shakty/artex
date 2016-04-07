/**
 * # Functions used player clients in the Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    init: init,
    instructions: instructions,
    quiz: quiz,
    creation: creation,
    submission: submission,
    evaluation: evaluation,
    dissemination: dissemination,
    questionnaire: questionnaire,
    endgame: endgame
};

function init() {
    var that, header;

    that = this;
    this.node.log('Init.');

    // Setup the header (by default on the left side).
    if (!W.getHeader()) {
        header = W.generateHeader();

        // W.setHeaderPosition('top');

        // Uncomment to visualize the name of the stages.
        //node.game.visualStage = node.widgets.append('VisualStage', header);

        node.game.rounds = node.widgets.append('VisualRound', header, {
            displayModeNames: ['COUNT_UP_STAGES_TO_TOTAL'],
            totStageOffset: 1
        });

        node.game.timer = node.widgets.append('VisualTimer', header);

        node.game.money = node.widgets.append('MoneyTalks', header, {
            currency: 'CHF', money: 10
        });

    }

    // Add the main frame where the pages will be loaded.
    if (!W.getFrame()) W.generateFrame();

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

    // Winners.
    this.winners = { A: [], B: [], C: [] };

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
        var button;
        decision = decision || node.game.last_ex;
        if (decision) {
            button = W.getElementById('decision');
            button.disabled = false;
            button.value = 'Click here to submit to exhibition: ' + decision;
        }
    };

    // Current rounds of evalutions (review delivered by subject).
    // For each item it contains if the slider was moved, a reference
    // to the input containing the current value, and the exhibition.
    this.evas = {};

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
        if (stepName === 'creation' || stepName === 'submission') {
            w = 100;
            h = 100;
        }
        else {
            w = 200;
            h = 200;
        }

        cfOptions = {
            width: w,
            height: h,
            features: cell.content.cf,
            id: false,
            controls: false,
            onChange: false,
            title: false
        };

        if (stepName !== 'submission') {

            cfOptions.onclick = function() {
                var f, cf, cfOptions;
                var div, buttons;

                f = this.getAllValues();

                cfOptions = {
                    id: false,
                    width: 400,
                    height: 400,
                    features: f,
                    controls: false,
                    onChange: false,
                    title: false
                };

                cf = node.widgets.get('ChernoffFaces', cfOptions);

                div = $('<div class="copyorclose">');
                $(cf.canvas).css('background', 'white');
                $(cf.canvas).css('border', '3px solid #CCC');
                $(cf.canvas).css('padding', '5px');

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
                                time: node.timer.getTimeSince('step'),
                                author: cell.content.author,
                                ex: cell.content.ex,
                                mean: cell.content.mean,
                                round: cell.content.round
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
                    width: 460,
                    height: 560,
                    show: "blind",
                    hide: "explode",
                    buttons: buttons
                });
            };
        }
        

        // Creating HTML.

        if (stepName !== 'submission') {
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
            return container;
        }
        else {
            debugger
            // Just canvas.
            cf = node.widgets.get('ChernoffFaces', cfOptions);
            return cf.getCanvas();
        }
        
    };
}

function instructions() {

    W.loadFrame(node.game.settings.instrPage, function() {

        // TODO: html pages have own button and js handler.
        var b = W.getElementById('read');
        b.onclick = function() {
            node.done();
        };

        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.done();
            }, 2000);
        });
    });
    console.log('Instructions');
}

function quiz() {
    W.loadFrame('quiz.html', function() {
        var button, QUIZ;

        QUIZ = W.getFrameWindow().QUIZ;
        button = W.getElementById('submitQuiz');

        node.on('check-quiz', function() {
            var answers;
            answers = QUIZ.checkAnswers(button);
            if (answers.correct || node.game.timer.isTimeup()) {
                node.emit('INPUT_DISABLE');
                // On Timeup there are no answers.
                node.done(answers);
            }
        });


        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.game.timer.doTimeUp();
            });
        });
    });
    console.log('Quiz');
}

function creation() {
    W.loadFrame('creation.html', function() {
        node.on('CLICKED_DONE', function() {
            $( ".copyorclose" ).dialog('close');
            $( ".copyorclose" ).dialog('destroy');
        });
    });
    console.log('Creation');
}

function evaluation() {
    W.loadFrame('evaluation.html');
    console.log('Evaluation');
}

function submission() {
    W.loadFrame('submission.html', function() {
        var creaDiv, f, options;
        var hisDiv;

        creaDiv = W.getElementById("creation");
        f = node.game.cf.getAllValues();

        options = {
            id: false,
            width: 200,
            height: 200,
            features: f,
            controls: false,
            onChange: false,
            title: false
        };

        node.widgets.append('ChernoffFaces', creaDiv, options);

//         hisDiv = W.getElementById("history")
// 
//         // Append history, if there is any.
//         if (this.getCurrentGameStage().round !== 1) {
//             hisDiv.appendChild(node.game.all_ex.getRoot())
//         }


        addImagesToEx('A');
        addImagesToEx('B');
        addImagesToEx('C');
        

        function addImagesToEx(ex) {
            var table = new W.Table({
                className: 'exhibition',
                render: {
                    pipeline: node.game.renderCF,
                    returnAt: 'first'
                }
            });
            table.addColumn(node.game.winners[ex]);
            table.parse();
            W.getElementById('ex-' + ex).appendChild(table.table);
        }

    });
    console.log('Submission');
}

function dissemination() {

    var dt_header, table;

    dt_header = 'Round: ' + node.player.stage.round;
    this.all_ex.addDT(dt_header);

    table = new W.Table({
        className: 'exhibition',
        render: {
            pipeline: this.renderCF,
            returnAt: 'first'
        }
    });
    table.setHeader(this.exhibitNames);

    W.loadFrame('dissemination.html', function() {

        node.game.timer.stop();

        node.on.data('WIN_CF', function(msg) {
            var str, res;
            var j, winners;
            console.log('WWWWWWWWWIN_CF');

            if (!msg.data) {
                node.err('Error: No data received on WIN_CF.');
                return;
            }

            // debugger
            if (msg.data.winners) {
                makeExColumn('A', msg.data.A);
                makeExColumn('B', msg.data.B);
                makeExColumn('C', msg.data.C);
            }
            else {
                str = 'No painting was considered good enough ' +
                    'to be put on display.';
                W.write(str, W.getElementById("container_exhibition"));
                this.all_ex.addDD(str);
            }

            W.getElementById('container_exhibition')
                .appendChild(table.parse());

            this.all_ex.addDD(table);

            node.game.timer.restart({
                milliseconds: node.game.settings.timer.dissemination,
                timeup: 'DONE'
            });
        });

        node.on.data('PLAYER_RESULT', function(msg) {
            if (!msg.data) return;
            var str = '';
            // Create string.
            if (msg.data.published) {
                str += 'Congratulations! You published in exhibition: ';
                str += '<strong>' + msg.data.ex + '</strong>. ';
                str += 'You earned <strong>' + msg.data.payoff;
                str += ' CHF</strong>. ';
                node.emit('MONEYTALKS', parseFloat(msg.data.payoff));
            }
            else {
                str += 'Sorry, you got rejected by exhibition: ' +
                    '<strong>' + msg.data.ex + '</strong>. ';
            }
            str += 'Your average review score was: <strong>' +
                msg.data.mean + '</strong>.</br></br>';
            // Assign string.
            W.getElementById('results').innerHTML = str;
        });

        // Auto play.
        node.env('auto', function() {
            node.timer.randomExec(function() {
                node.done();
            }, 5000);
        });

        function makeExColumn(ex, data) {
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
            node.game.winners[ex] = node.game.winners[ex].concat(winners);
        }

    });

    console.log('Dissemination');
}

function questionnaire() {
    W.loadFrame(node.game.settings.questPage);
    console.log('Postgame');

    // Auto play.
    node.env('auto', function() {
        node.timer.randomExec(function() {
            node.done();
        }, 5000);
    });

}

function endgame() {
    W.loadFrame('ended.html');
    console.log('Game ended');
}

