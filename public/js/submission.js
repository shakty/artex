// Script loaded by creation.html.
$(document).ready(function() {
    var node = parent.node;
    var settings = node.game.settings;
    var J = parent.JSUS;
    var ids;
    node.game.subOrder = J.shuffleElements(document.getElementById("tr-decision"));
    ids = [node.game.subOrder[0] + '-past-images',
           node.game.subOrder[1] + '-past-images',
           node.game.subOrder[2] + '-past-images'
          ];
    J.shuffleElements(document.getElementById("tr-past-images"), ids);

    document.getElementById('reward-A').innerHTML = node.game.settings.exA.reward;
    document.getElementById('reward-B').innerHTML = node.game.settings.exB.reward;
    document.getElementById('reward-C').innerHTML = node.game.settings.exC.reward;


    var ruleA, ruleB, ruleC, valueRuleA, valueRuleB, valueRuleC;
    var rewardTextA, rewardTextB, rewardTextC, competitiveSplit;
    ruleA = document.getElementById('rule-A');
    ruleB = document.getElementById('rule-B');
    ruleC = document.getElementById('rule-C');
    valueRuleA = document.getElementById('available-A');
    valueRuleB = document.getElementById('available-B');
    valueRuleC = document.getElementById('available-C');
    if (settings.treatmentName === 'tournament') {
        ruleA.innerHTML = 'Available rewards';
        ruleB.innerHTML = 'Available rewards';
        ruleC.innerHTML = 'Available rewards';
        valueRuleA.innerHTML = settings.exA.N;
        valueRuleB.innerHTML = settings.exB.N;
        valueRuleC.innerHTML = settings.exC.N;
    }
    // Threshold.
    else {
        if (settings.com) {
            rewardTextA = document.getElementById('reward-text-A');
            rewardTextB = document.getElementById('reward-text-B');
            rewardTextC = document.getElementById('reward-text-C');
            competitiveSplit = '<span class="smallInfo">Split among displayed images.</span>';
            rewardTextA.innerHTML += competitiveSplit;
            rewardTextB.innerHTML += competitiveSplit;
            rewardTextC.innerHTML += competitiveSplit;
        }
        ruleA.innerHTML = 'Review threshold';
        ruleB.innerHTML = 'Review threshold';
        ruleC.innerHTML = 'Review threshold';
        valueRuleA.innerHTML = settings.exA.threshold;
        valueRuleB.innerHTML = settings.exB.threshold;
        valueRuleC.innerHTML = settings.exC.threshold;
    }
});
