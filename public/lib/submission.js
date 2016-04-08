// Script loaded by creation.html.
$(document).ready(function() {
    var node = parent.node;
    var J = parent.JSUS;
    var ids;
    node.game.subOrder = J.shuffleNodes(document.getElementById("tr-decision"));
    ids = [node.game.subOrder[0] + '-past-images',
           node.game.subOrder[1] + '-past-images',
           node.game.subOrder[2] + '-past-images'
          ];
    J.shuffleNodes(document.getElementById("tr-past-images"), ids);
    
    // AUTOPLAY
    ////////////
    node.env('auto', function() {
        return;
    	node.timer.randomExec(function() {
    	    var choice, odd, ex;

//             // Round/color dependent.
//             odd = node.player.stage.round % 2 === 1;
//     	    if (node.player.color === 'green') {
//     		ex =  odd ? 'ex_A' : 'ex_B';
//     	    }
//             else if (node.player.color === 'red') {
//                 ex =  odd ? 'ex_B' : 'ex_C';    		
//     	    }
//     	    else {
//                 ex =  odd ? 'ex_C' : 'ex_A';    		
//     		
//     	    }

             // Completely random.
             choice = Math.random();                     
             if (choice < 0.33) ex = 'A';
             else if (choice < 0.66) ex = 'B';            
             else ex = 'C';            

    	    node.window.getElementById('td-' + ex).click();
            node.window.getElementById('decision').click();

	}, 4000);
    });

});