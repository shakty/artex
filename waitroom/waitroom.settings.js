/**
 * Standard Waiting Room settings.
 */

var path = require('path');
var mturkConf = path.resolve(__dirname, '..', 'amt/mturk.conf.js');
var ngamt = require('nodegame-mturk')( { config: mturkConf });

var EXPIRE_LIMIT;
var RE_EXTEND_TIME = 3600;
var RE_EXTEND_ASS = 5;

module.exports = {

    // How many clients must connect before groups are formed.
    POOL_SIZE: 1,

    // The size of each group.
    GROUP_SIZE: 1,

    // Maximum waiting time.
    // MAX_WAIT_TIME: 600000,

    // Treatment assigned to groups.
    // If left undefined, a random treatment will be selected.
    // Use "treatment_rotate" for rotating the treatmenrs.
    CHOSEN_TREATMENT: 'rank_skew', // 'rank_same',

    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',

    ON_CONNECT: function(room, player) {
        var part2, totPlayers, logger;
        logger = room.channel.sysLogger;

        totPlayers = getTotPlayers(room, '*****conne', player);

        // Expire HIT if we have 20 players between the two rooms.
        if (!room.hitExpired && totPlayers >= EXPIRE_LIMIT) {
            room.hitExpired = true;
            room.closeRoom('afterDispatch');


            console.log('<<<<<<<<<<<<<<<<<<<<<<<< ');
            console.log('LIMIT LOWER ', totPlayers, EXPIRE_LIMIT);
            console.log('<<<<<<<<<<<<<<<<<<<<<<<< ');

            ngamt.modules.manageHIT.expire(function(err) {

                console.log('oooooooooooooooooooooooo ');
                console.log('EXPIRE ', err);
                console.log('oooooooooooooooooooooooo ');

                if (err) {
                    room.hitExpired = false;
                    room.openRoom();
                    logger.log('error exp ' + totPlayers, 'error');
                }
                else {
                    logger.log('HIT EXPIRED ' + totPlayers, 'info');
                }
            });
        }
        else {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>> ');
            console.log('LIMIT HIGHER ', totPlayers, EXPIRE_LIMIT);
            console.log('>>>>>>>>>>>>>>>>>>>>>>>> ');
    },

    ON_DISCONNECT: function(room, player) {
        var part2, totPlayers, logger;
        logger = room.channel.sysLogger;

        if (room.getDispatchState() !== room.constructor.dispatchStates.NONE) {
            return;
        }
        totPlayers = getTotPlayers(room, '------disco', player);

        // Expire HIT if we have 20 players between the two rooms.
        if (room.hitExpired && totPlayers < EXPIRE_LIMIT) {
            room.hitExpired = false;
            room.openRoom();
            // Extend or mark as expired again.
            ngamt.modules.manageHIT.extend({
                assignments: RE_EXTEND_ASS,
                time: RE_EXTEND_TIME
            }, function(err) {
                if (err) {
                    // Reset
                    room.hitExpired = true;
                    room.closeRoom();
                    logger.log('error ext ' + err, 'error');
                }
                else {
                    logger.log('HIT EXTENDED ' + totPlayers, 'info');
                }
            });
        }
    },

    ON_INIT: function(room) {
        var part2;
        part2 = room.channel.gameLevels.part2.waitingRoom;
        EXPIRE_LIMIT = part2.POOL_SIZE * 2;
        room.hitExpired = false;
        ngamt.api.connect({ getLastHITId: true });
    },

    DISPATCH_TO_SAME_ROOM: true
};

// ## Helper methods

/**
 * ## Returns the total number of players across the two levels
 *
 * If part2 has not dispatched 2 games already, it return 0
 *
 * @param {WaitingRoom} room This waiting room
 *
 * @return {number} The total number of players
 */

var oldNP;
function getTotPlayers(room, action, p) {
    var part2, room1, np, logger;
    logger = room.channel.sysLogger;
    part2 = room.channel.gameLevels.part2.waitingRoom;
    np = part2.size() + room.size();
    room1 = room.channel.gameRooms.room1;
    if (room1) np += room1.size();
    np += part2.numberOfDispatches * part2.GROUP_SIZE;
    console.log('NP COUnT: ',  np, action, room.hitExpired, p ? p.id : '');
    logger.log('NP COUnT: ' +  np + ' ' + action + ' ' +
               room.hitExpired + ' ' + (p ? p.id : ''));

//     if ('undefined' === typeof oldNP) oldNP = np;
//     else if (np > oldNP) oldNP = np;
//     else if (np < oldNP) d ebugger;
    return np;
}
