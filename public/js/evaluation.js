// Script loaded by evaluation.html.
$(document).ready(function() {

    console.log('Evaluation');

    var node = parent.node,
    W = parent.W;

    var table, str, reconReviews;
    table = new W.Table({ id: 'tbl_evaluation' });
    document.getElementById('container_evaluation').appendChild(table.table);


    if (node.game.settings.competition === "tournament") {
        str = 'Paintings will be ranked by <em>average</em> evaluation, and ' +
            'if their rank is high enough for the chosen exhibition they ' +
            'will be put on display.';
    }
    else {
        str = 'Paintings that receive an <em>average</em> evaluation greater ' +
              'than the threshold for the chosen exhibition will be put ' +
              'on display.'
    }
    W.setInnerHTML('brief-explanation', str);

    function makeReviewUI(exData, idx) {
        var cf, display, display_container, sl, head;
        var ex, author, evaId, displayEvaId, displayContId;
        var jQuerySlider, labelText;
        var i, len;
        var cf_options, data;

        cf_options = {
            width: 300,
            height: 300,
            scaleX: 1,
            scaleY: 1,
            change: false,
            controls: false
        };

        i = -1, len = exData.length;
        for ( ; ++i < len ; ) {

            data = exData[i];
            // Create Chernoff face.
            cf_options.features = data.face;
            cf = node.widgets.get('ChernoffFaces', cf_options);

            // Create Evaluation interface.
            author = data.author;
            // Create object that will store all info about this review.
            node.game.evas[author] = { order: idx + '.' + i };

            evaId = 'eva_' + author;
            displayEvaId = 'display_' + author;
            displayContId = 'display_cont_' + author;

            // Add the slider to the container.
            sl = W.get('div', { id: evaId });
            display_container = W.get('div', { id: displayContId });
            display = W.add('input', display_container, {
                id: displayEvaId,
                type: 'text',
                disabled: "disabled",
                className: 'curr-eva-input'
            });

            labelText = 'Your current evaluation: ';
            W.add('label', display_container, {
                label: labelText,
                'for': display,
                // display, null,
            });

            node.game.evas[author].display = display;

            // Exhibition.
            ex = data.ex;
            node.game.evas[author].ex = ex;

            // Table (need to be parsed, otherwise jQuery slider fails.
            head = document.createElement('span');
            head.innerHTML = 'Review for Exhibition: ' + ex;
            head.className = 'ex-header';

            // Build the canvas and draws the face.
            cf.buildCanvas();

            // Add Exhibition column.
            table.addColumn([head, sl, display_container, cf.getCanvas()]);
            table.parse();

            // Add jquery slider.
            jQuerySlider = $("#" + evaId);
            jQuerySlider.slider({
                value: 5,
                min: 0,
                max: 10,
                step: 0.1,
                slide: function(event, ui) {
                    var author = this.id.substr(4);
                    var slid = 'display_' + author;
                    $("#" + slid).val(ui.value);
                    node.game.evas[author].changed = true;
                }
            });
            $("#" + displayEvaId).val($("#" + evaId).slider("value"));


            // AUTOPLAY.
            node.env('auto', function() {
                $("#" + evaId).slider("value", Math.random() * 10);
                $("#" + displayEvaId).val($("#"+evaId).slider("value"));
            });
        }
    }

    function makeReviewerUI(exData) {
        var ex;
        if (!exData) {
            node.err('makeReviewerUI: no data received.');
            return;
        }

        // Append images to review to table in random exhibition order.
        ex = node.game.evasOrder[0];
        if (exData[ex] && exData[ex].length) makeReviewUI(exData[ex], 1);
        ex = node.game.evasOrder[1];
        if (exData[ex] && exData[ex].length) makeReviewUI(exData[ex], 2);
        ex = node.game.evasOrder[2];
        if (exData[ex] && exData[ex].length) makeReviewUI(exData[ex], 3);
    }

    reconReviews = node.game.getProperty('reconReviews');
    if (!reconReviews) {
        node.on.data('CF', function(msg) {
            console.log('RECEIVED CF ********************');
            makeReviewerUI(msg.data);
        });
    }
    else {
        makeReviewerUI(reconReviews);
    }

});
