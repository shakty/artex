/**
 * Standard Waiting Room settings.
 */

var path = require('path');
//var mturkConf = path.resolve(__dirname, '..', 'amt/mturk.conf.js');
//var ngamt = require('nodegame-mturk')( { config: mturkConf });

var EXPIRE_LIMIT;
var RE_EXTEND_TIME = 3600;
var RE_EXTEND_ASS = 5;
var BUFFER = 6;

// If you change this you must change also the same variable
// in: levels/part2/waitrom/waitroom.settings.js
var NDISPATCHES = 3;

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
        var totPlayers;

        totPlayers = getTotPlayers(room, '*****conne', player);

        // Expire HIT if we have enough players between the two rooms.
        if (!room.hitExpired && (totPlayers >= EXPIRE_LIMIT)) {
            room.expireHIT('afterDispatch');
        }
    },

    ON_DISCONNECT: function(room, player) {
        var totPlayers, logger;
        if (room.part2Done) return;

        logger = room.channel.sysLogger;

        if (room.getDispatchState() !== room.constructor.dispatchStates.NONE) {
            return;
        }
        totPlayers = getTotPlayers(room, '------disco', player);

        // Expire HIT if we have enough players between the two rooms.
        if (room.hitExpired && totPlayers < EXPIRE_LIMIT) {
            room.unexpireHIT();
        }
    },

    ON_INIT: function(room) {
        var part2, logger;

        logger = room.channel.sysLogger;
        part2 = room.channel.gameLevels.part2.waitingRoom;

        EXPIRE_LIMIT = (part2.POOL_SIZE * NDISPATCHES) + BUFFER;
        logger.log('EXPIRE LIMIT: ' + EXPIRE_LIMIT, 'warn');

        room.hitExpired = false;
        //ngamt.api.connect({ getLastHITId: true });

        // Define un/expire HIT functions.
        room.expireHIT = function(mod) {
            room.channel.gameInfo.auth.claimId = false;
            room.hitExpired = true;
            room.closeRoom(mod);

            //ngamt.modules.manageHIT.expire(function(err) {
            //    if (err) {
            //        room.channel.gameInfo.auth.claimId = true;
            //       room.hitExpired = false;
            //       room.openRoom();
            //        logger.log('error exp ', 'error');
            //    }
            //    else {
            //        logger.log('HIT EXPIRED ', 'info');
            //    }
            //});
        };

        room.unexpireHIT = function() {
            return;
            room.hitExpired = false;
            room.channel.gameInfo.auth.claimId = true;
            room.openRoom();
            // Extend or mark as expired again.
            ngamt.modules.manageHIT.extend({
                assignments: RE_EXTEND_ASS,
                time: RE_EXTEND_TIME
            }, function(err) {
                if (err) {
                    // Reset
                    room.channel.gameInfo.auth.claimId = false;
                    room.hitExpired = true;
                    room.closeRoom();
                    logger.log('error extending HIT', 'error');
                    logger.log(err, 'error');
                }
                else {
                    logger.log('HIT EXTENDED ', 'info');
                }
            });
        };

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
    logger.log('NP COUnT: ' +  np + ' ' + action + ' ' +
               room.hitExpired + ' ' + (p ? p.id : ''), 'info');

//     if ('undefined' === typeof oldNP) oldNP = np;
//     else if (np > oldNP) oldNP = np;
//     else if (np < oldNP) d ebugger;
    return np;
}
