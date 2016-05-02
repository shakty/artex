// Script loaded by creation.html.
$(document).ready(function() {
    var node, W, q, names, i, len, tmpElement, options;
    node = parent.node;
    W = parent.W;
    q = node.game.questionnaire;
    W.noEscape(window);
    names = node.game.qNames;
    i = -1, len = names.length;
    for ( ; ++i < len ; ) {
        name = names[i];
        options = {
            tableId: name,
            title: false
        };

        if (name === 'enjoy' || name === 'competitive') {
            options.choices = node.JSUS.seq(0,10);
        }
        else {
            options.choices = [ 'A', 'B', 'C', [ 'Other', "Don't know" ] ];
        }

        q[name] = node.widgets.append('ChoiceTable',
                                      W.getElementById(name + '_answers'),
                                      options);
    }
});