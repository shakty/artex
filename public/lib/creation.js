// Script loaded by creation.html.
$(document).ready(function() {

    var node = parent.node;
    var J = node.JSUS;
    var W = node.window;
    var GameStage = node.GameStage;

    node.window.noEscape(window);

    function addJQuerySliders(init) {
        $('#cf_controls div.ui-slider').each(function() {
            // Read initial values from markup and remove that.
            var settings = init[this.id];
            if (settings) {
                settings.slide = settings.change = function(e, ui) {
                    node.emit('CF_CHANGE'); // TODO: use a param here.
                };
                $(this).slider(settings);
            }
        });
    };

    function initSubmitDialog() {
        var dialog_options;

        dialog_options = {
            autoOpen: false,
            resizable: false,
            width: 550,
            height: node.env.review_select ? 310 : 300,
            modal: true,
            zindex: 100,
            closeOnEscape: false,
            close: function() {
                return false;
            },
        };

        if (!node.game.timer.isTimeup()) {
            dialog_options.buttons = {
                Cancel: function() {
                    $(this).dialog('close');
                }
            };
        }

        node.game.timer.gameTimer.restart({
            milliseconds: 20000,
            timeup: function() {
                var ex;
        	// Submit to the last one, if any.
                if (node.game.last_ex) {
                    ex = node.game.last_ex;
                }
                else {
                    ex = node.game.exhibitNames[
                        J.randomInt(node.game.nExhibits)-1];
                }
                node.done(ex);
            }
        })

        $('#sub_list').dialog(dialog_options);
    }

    // TODO: do we need as an emit? Can we do it inside the jQuery dialog?
    node.on('COPIED', function(f) {
        node.game.cf.draw(f);
        addJQuerySliders(CFControls.normalizeFeatures(f));
    });

    // Initialize Chernoff Face
    ////////////////////////////

    var creationDiv;
    var cf_options, init_cf;
    var init_sc, cfc;

    // If we play the first round we start with a random face,
    // otherwise with the last one created
    if (!node.game.last_cf) {
        init_cf = node.widgets.widgets.ChernoffFaces.FaceVector.random();
        // Some features are fixed in the simplified version
        init_cf = CFControls.pinDownFeatures(init_cf);

// TODO: store somewhere the initial random face.
// 	node.set({
//             cf0: init_cf
//         });
    }
     else {
         init_cf = node.game.last_cf;
     }

    // Important: set the player color.
    init_cf.color = 'black';

    init_sc = CFControls.normalizeFeatures(init_cf);

    cfc = new CFControls({
        id: 'cf_controls',
        features: init_sc
    });


    creationDiv = document.getElementById('creation');

    cf_options = {
        id: 'cf_creation',
        width: 500,
        height: 500,
        features: init_cf,
        controls: cfc,
        title: false
    };
    node.game.cf = node.widgets.append('ChernoffFaces',
                                       creationDiv,
                                       cf_options);

    // Adding the jQuery sliders
    ////////////////////////////
    addJQuerySliders(init_sc);

    // History of previous exhibits
    ///////////////////////////////

    var historyDiv = document.getElementById('history');

    if (node.game.all_ex.size() > 0) {
        node.game.all_ex.parse();
        historyDiv.appendChild(node.game.all_ex.getRoot());
    }
    else {
        historyDiv.appendChild(
            document.createTextNode('No past exhibitions yet.'));
    }

    // Canvas tooltip.
    node.events.step.emit('canvas_tooltip');

    // AUTOPLAY
    ////////////
//     node.env('auto', function() {
//     	node.timer.randomExec(function() {
//             W.getElementById('done_button_box').click();
// 	}, 2000);
//     });

});