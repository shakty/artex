// Script loaded by creation.html.
$(document).ready(function() {
    var node, W, q, names, i, len, tmpElement, tables, j, lenJ;
    var options, choices, subqs;
    var tableName, dt, id;
    node = parent.node;
    W = parent.W;
    q = node.game.questionnaire;
    W.noEscape(window);
    names = node.game.qNamesExtra;
    choices = node.JSUS.seq(0,10);
    // Shuffle names.
    node.JSUS.shuffle(names);
    i = -1, len = names.length-1; // Not last one (freecomment).
    for ( ; ++i < len ; ) {
        name = names[i];
        // Meta object with all subquestions.
        q[name] = {};
        tmpElement = document.getElementById(name + '_dl');
        subqs = node.game.qNamesExtraSubs[name];
        // Shuffle sub-questions within each category.
        node.JSUS.shuffle(subqs);
        j = -1, lenJ = subqs.length;
        for ( ; ++j < lenJ ; ) {
            id = subqs[j].id;
            tableId = name + '_' + id;
            // Create a new dt element where to append the table.
            dt = document.createElement('dt');
            dt.id = tableId + '_dt';
            tmpElement.appendChild(dt);

            options = {
                tableId: tableId,
                mainText: subqs[j].mainText,
                title: false,
                choices: choices,
                group: name,
                groupOrder: j
            };
            q[name][id] = node.widgets.append('ChoiceTable', dt, options);
        }
    }
});