// Script loaded by creation.html.
$(document).ready(function() {
    var node, W, q, names, i, len, tmpElement;
    node = parent.node;
    W = parent.W;
    q = node.game.questionnaire;
    W.noEscape(window);
    names = ['exbeau', 'exinn', 'exfair']; // 'enjoy', 'competitive', 
    i = -1, len = names.length;
    for ( ; ++i < len ; ) {
        name = names[i];
        tmpElement = document.getElementById(name + '_answers');
        q[name].order = W.shuffleElements(tmpElement);
    }
    tmpElement = document.getElementById('enjoy_table');
    tmpElement.addEventListener('click', node.game.makeChoiceTD);
    tmpElement = document.getElementById('competitive_table');
    tmpElement.addEventListener('click', node.game.makeChoiceTD);
});