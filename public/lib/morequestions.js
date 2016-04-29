// Script loaded by creation.html.
$(document).ready(function() {
    var node, W, q, names, i, len, tmpElement;
    node = parent.node;
    W = parent.W;
    q = node.game.questionnaire;
    W.noEscape(window);
    names = node.game.qNamesExtra;
    i = -1, len = names.length-1; // Not last one (freecomment).
    for ( ; ++i < len ; ) {
        name = names[i];
        tmpElement = document.getElementById(name + '_dl');
        q[name].order = W.shuffleElements(tmpElement);        
        //tmpElement = document.getElementById(name + '_table');
        //tmpElement.addEventListener('click', node.game.makeChoiceTD);
    }
});