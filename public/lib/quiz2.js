// Script loaded by creation.html.
$(document).ready(function() {

    var node =  parent.node,
    J = parent.JSUS,
    W = parent.W;


    var results, answers;
    var wrongTxt, correctTxt;

    results = { correct: false };

    wrongTxt = 'Wrong, try again';
    correctTxt = 'Correct!';

    node.env('com', function() {
        node.env('review_select', function() {
            answers = {
                coocom: 3,
                reviewSelect: 2,
                reviewRange: 0
            };	
        });
        node.env('review_random', function() {
            answers = {
                coocom: 3,
                reviewSelect: 3,
                reviewRange: 0
            };
        });  
    });

    node.env('coo', function() {
        node.env('review_select', function() {
            answers = {
                coocom: 2,
                reviewSelect: 2,
                reviewRange: 0
            };
        });
        node.env('review_random', function() {
            answers = {
                coocom: 2,
                reviewSelect: 3,
                reviewRange: 0
            }; 
        });
    });


});