// Script loaded by creation.html.
$(document).ready(function() {
    var node, W, q, names, i, len, tmpElement;
    node = parent.node;
    W = parent.W;
    q = node.game.questionnaire;
    names = node.game.qNames;
    i = -1, len = names.length;
    for ( ; ++i < len ; ) {
        name = names[i];
        if (name !== 'enjoy' && name !== 'competitive') {
            tmpElement = document.getElementById(name + '_tr');
            q[name].order = W.shuffleElements(tmpElement);
        }
        tmpElement = document.getElementById(name + '_table');
        tmpElement.addEventListener('click', node.game.makeChoiceTD);
    }
});