// Script loaded by creation.html.
$(document).ready(function() {

    var node =  parent.node,
    J = parent.JSUS;

    var quizzes, opts;
    var i, len, s;

    var root, groupOrder, correctChoice;

    s = node.game.settings;

    quizzes = [
        {
            id: 'reviewRange',
            mainText: 'When reviewing a painting, on which scale can you ' +
                'express your liking?',
            choices: [ 'From 0 to 10', 'From 1 to 5', 'From 1 to 9' ],
            correctChoice: 0,
        },
        {
            id: 'reviewSelect',
            mainText: 'How are reviewers assigned to images and exhibitions?',
            choices: [
                'Randomly',
                'If I submit or display in an exhibition I am more likely to ' +
                    'become a reviewer for that exhibition in the next round',
                'At the beginning the game I am assigned to an exhibition ' +
                    'and I always review for that one'
            ],
            correctChoice: s.review_select ? 1 : 0,
            orientation: 'V'
        },
        {
            id: 'rewards',
            mainText: 'After you have created a painting, and reviewed the ' +
            'paintings of other participants, what happens next?',
            choices: [
                'All paintings are displayed with their review score',
                'Paintings are ranked globally and the best ones are displayed',
                'Paintings are ranked within each exhibition, the best ' +
                    'ones in each exhibition are displayed',
                'Painting with a review score higher than the ' +
                    'threshold are put on display',

            ],
            correctChoice: s.competition === 'threshold' ? 3 : 2,
            orientation: 'V'
        },
        {
            id: 'payoff',
            mainText: 'What is the payoff for those with a painting on display?',
            choices: [
                'The payoff is the same for all',
                'The payoff depends on the exhibition of choice',
                'The payoff varies depending on how many others have ' +
                    'a painting on display in the same exhibition'
            ],
            orientation: 'V'
        }
    ];

    // Settings correct choice for the payoff question.
    if (s.competition === 'threshold') correctChoice = s.com ? 2 : 0;
    else correctChoice = 1;
    quizzes[3].correctChoice = correctChoice;
    // Make sure quizzes order is correct.
    if (quizzes[3].id !== 'payoff') alert('Something is wrong');

    // Append quizzes in random order.
    J.shuffle(quizzes);
    i = -1, len = quizzes.length;
    for ( ; ++i < len ; ) {
        groupOrder = (i+1);
        opts = quizzes[i];
        opts.groupOrder = groupOrder;
        opts.title = false;
        opts.shuffleChoices = true;
        opts.group = 'quiz';
        root = document.getElementById('q_' + groupOrder);
        node.game.quizzes.push(node.widgets.append('ChoiceTable', root, opts));
    }

});
