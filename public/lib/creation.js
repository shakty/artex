// Script loaded by creation.html.
$(document).ready(function() {

    var node = parent.node;
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
        var dialog_options = {
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

        if (node.game.timer.gameTimer.timeLeft) {
            var left = node.game.timer.gameTimer.timeLeft;
            dialog_options.buttons = {
                Cancel: function() {
                    $(this).dialog('close');
                }};

        }

        node.game.timer.gameTimer.restart({
            milliseconds: 20000,
            timeup: function() {
        	// submit to the last one, if any
                if (node.game.last_ex) {
                    node.done(node.game.last_ex);
                }
                else {
                    var exs = ['A','B','C'];
                    var ex = exs[node.JSUS.randomInt(3)-1];
                    node.done(ex);
                }
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
    var init_sc, sc_options;
    var cfc;

    // If we play the first round we start with a random face,
    // otherwise with the last one created
    if (!node.game.last_cf) {
        init_cf = node.widgets.widgets.ChernoffFaces.FaceVector.random();
        // Some features are fixed in the simplified version
        init_cf = CFControls.pinDownFeatures(init_cf);
    }
     else {
         init_cf = node.game.last_cf;
     }

    // Important: set the player color.
    // init_cf.color = node.player.color;

    init_sc = CFControls.normalizeFeatures(init_cf);
    sc_options = {
        id: 'cf_controls',
        features: init_sc,
        change: 'CF_CHANGE',
    };
    cfc = new CFControls(sc_options);


    creationDiv = document.getElementById('creation');

    cf_options = {
        id: 'cf',
        width: 500,
        height: 500,
        features: init_cf,
        controls: cfc,
        title: false
    };
    node.game.cf = node.widgets.append('ChernoffFaces', creationDiv,cf_options);


    // Copy face_0
    if (GameStage.compare(node.game.state, '3.1.1') === 0) {
    	node.set({
            t0: true,
            cf: node.game.cf.getAllValues()
        });
    }

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
        historyDiv.appendChild(document.createTextNode('No past exhibitions yet.'));
    }


    // Submission
    //////////////


    $('#done_box button').click(function(){
        $(function() {
            // Notify the game engine that the button has been
            // clicked. This way any other jQuery dialog can
            // get closed
            node.emit('CLICKED_DONE');

            // If time is up reopen the dialog immediately
            // if it gets closed
            $("#sub_list").bind("dialogclose", function(event, ui) {
                $("#sub_list").dialog('destroy');
                if (!node.game.timer.gameTimer.timeLeft) {
                    initSubmitDialog();
                    $("#sub_list").dialog('open');
                }
            });

            initSubmitDialog();
            $("#sub_list").dialog('open');

        });
    });



    // Tooltip for enlarge and copy canvas
    //////////////////////////////////////

    $('#all_ex canvas').hover(
        function(e) {
            var txt = "<span id='enlarge'>Click to enlarge, " +
                "and decide if copying it</span>";
            var enlarge = $(txt);
            var pos = $(this).position();
            enlarge.addClass('tooltip');
            enlarge.css({"left": (5 + e.pageX) + "px","top":e.pageY + "px" });
            $(this).before(enlarge);
            $(this).mousemove(function(e){
                $('span#enlarge').css(
                    {"left": (5 + e.pageX)  +
                     "px","top":e.pageY + "px"
                    });
            });
        },
        function() {
            $(this).parent().find("span#enlarge").remove();
            $(this).unbind('mousemove');
        });

    // AUTOPLAY
    ////////////
    node.env('auto', function() {
    	node.timer.randomExec(function() {
    	    var ex, button;

    	    if (node.player.color === 'green') {

    		if (node.game.state.round % 2 === 1) {
    		    ex = 'ex_A';
    		}
    		else {
    		    ex = 'ex_B';
    		}
    	    }

    	    if (node.player.color === 'red') {

    		if (node.game.state.round % 2 === 1) {
    		    ex = 'ex_B';
    		}
    		else {
    		    ex = 'ex_C';
    		}
    	    }

    	    if (node.player.color === 'black') {

    		if (node.game.state.round % 2 === 1) {
    		    ex = 'ex_C';
                }
    		else {
    		    ex = 'ex_A';
    		}
    	    }

            //    		  var choice = Math.random();
            //
            //
            //    		  if (choice < 0.33) {
            //    			  ex = 'ex_A';
            //    		  }
            //    		  else if (choice < 0.66) {
            //    			  ex = 'ex_B';
            //    		  }
            //    		  else {
            //    			  ex = 'ex_C';
            //    		  }

    	    button = node.window.getElementById(ex);

    	    if (button) {
    		button.click();
    	    }
    	    else {
    		setTimeout(function(){
    		    button = node.window.getElementById(ex);
    		    if (!button) {
    			setTimeout(this, 1000);
    		    }
    		    else {
    			button.click();
    		    }
    		}, 1000);
    	    }

	}, 4000);
    });


});