/**
 * # Bot code for Art Exhibition Game
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players automatically.
 *
 * http://www.nodegame.org
 */

const J = require('nodegame-client').JSUS;
const path = require('path');

// Does not work. The widget is looking for node and fails.
// let wpath = J.resolveModuleDir('nodegame-widgets');
// let ChernoffFaces = require(path.resolve(wpath, 'widgets', 'ChernoffFaces.js'));
// let FaceVector = ChernoffFaces.FaceVector;


module.exports = function(treatmentName, settings, stager,
                          setup, gameRoom, node) {

    let FaceVector = require(path.resolve(__dirname,
                                          'includes', 'FaceVector.js'));

    // let game = {
    //     env: {
    //         auto: false,
    //         allowTimeup: false,
    //         allowDisconnect: false
    //     }
    // };

    stager.setOnInit(function(){

        node.game.mycolor = 'black';

        node.once.data('MYCOLOR', function(msg) {
            // console.log('MY COLOR IS ', msg.data);
            node.game.mycolor = msg.data;
        });
    })

    stager.extendAllSteps(function(o) {
        o.cb = function() {

            let id = node.game.getStepId();
            let params;

            if (id === 'creation') {
                node.game.lastCF = new FaceVector();
                node.game.lastCF.color = node.game.mycolor;
                params = {
                    cf: node.game.lastCF,
                    changes: [],
                    copies: []
                };
            }
            else if (id === 'submission') {
                node.game.last_ex =
                    node.game.settings.exhibitNames[J.randomInt(-1, 2)];

                params = {
                    ex: node.game.last_ex,
                    seeMore: 0
                };
            }
            else if (id === 'evaluation') {

                // We need to wait for creators' ids from server.
                node.game.evas = [];

                let out = [];

                // It does not always contain all the reviews to do,
                // multiple messages can arrive in the same step.
                node.on.data('CF', function(msg) {
                    let data = msg.data;
                    let evas = [];
                    if (data.A && data.A.length) {
                        data.A.forEach((item) => {
                            evas.push({ ex: 'A', creator: item.author });
                        });
                    }
                    if (data.B && data.B.length) {
                        data.B.forEach((item) => {
                            evas.push({ ex: 'B', creator: item.author });
                        });
                    }
                    if (data.C && data.C.length) {
                        data.C.forEach((item) => {
                            evas.push({ ex: 'C', creator: item.author });
                        });
                    }
                    node.game.evas = evas;

                    // console.log('RECEIVED CF by BOT ********************');
                    // console.log(evas);


                    evas.forEach(function(i) {
                        out.push({
                            creator: i.creator,
                            ex: i.ex,
                            eva: J.random()*10,
                            hasChanged: true,
                            order: out.length
                        });
                    });
                });

                // Larger wait time because may arrive separately.
                node.timer.random(3000, 6000).done({
                    reviews: out
                });
            }
            else if (id === 'dissemination') {
                params = { copies: [] };
            }

            if (id !== 'evaluation') {
                node.timer.random(1500, 3000).done(params);
            }

            // Not used for now.
            // // Allow disconnect and timeup.
            // if (node.env('allowDisconnect') && Math.random() < 0.5) {
            //     node.socket.disconnect();
            //     node.game.stop();
            //     node.timer.random(4000).exec(function() {
            //         node.socket.reconnect();
            //     });
            // }
            // else {
            //     if (!node.env('allowTimeup') || Math.random() < 0.5) {
            //         node.timer.random(1500).done();
            //     }
            // }

        };
        return o;
    });

};
