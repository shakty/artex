// Script loaded by creation.html.
$(document).ready(function() {
    var node = parent.node;
    var J = parent.JSUS;
    node.game.subOrder = J.shuffleNodes(document.getElementById("tr-decision"));
});