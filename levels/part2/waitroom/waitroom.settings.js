/**
 * Standard Waiting Room settings.
 */

var NDDB = require('NDDB').NDDB;

// Creates grouping db (will be reused for every grouping).
var db;
db =  new NDDB({update: { indexes: true } });
db.on('insert', function(i) {
    i.key = 'g' + i.gender + '_' + 'l' + i.location;
});
db.hash('key', function(i) {
    return i.key;
});

// If you change this you must change also the same variable
// in: levels/part2/waitrom/waitroom.settings.js
var NDISPATCHES = 3;
var NGAMES = NDISPATCHES * 2; // each dispatch 2 games.

// Exports settings.

module.exports = {

    /**
     * ## EXECUTION_MODE
     *
     * Sets the execution mode of the waiting room
     *
     * Different modes might have different default values, and need
     * different settintgs.
     *
     * Available modes:
     *
     *   - ´TIMEOUT´, waits until the time is up, then it checks
     *        whether enough players are connected to start the game.
     *   - ´WAIT_FOR_N_PLAYERS´, the game starts right away as soon as
     *        the desired number of connected players is reached.
     */
    // EXECUTION_MODE: 'TIMEOUT',
    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',

    /**
     * ## POOL_SIZE
     *
     * How many clients must connect before groups are formed
     */
    POOL_SIZE: 18,

    /**
     * ## GROUP_SIZE
     *
     * The size of each group
     */
    GROUP_SIZE: 9,

    /**
     * ## N_GAMES
     *
     * Number of games to dispatch
     *
     * If set, it will close the waiting room after N_GAMES
     * have been dispatched
     */
    // N_GAMES: 4,

    /**
     * ## MAX_WAIT_TIME
     *
     * Maximum waiting time in the waiting room
     */
   //  MAX_WAIT_TIME: 20000,

    /**
     * ## START_DATE
     *
     * Time and date of game start.
     *
     * Overrides `MAX_WAIT_TIME`. Accepted values: any valid
     * argument to `Date` constructor.
     */
    // START_DATE: 'December 13, 2015 13:24:00',
    // START_DATE: new Date().getTime() + 30000,

    /**
     * ## CHOSEN_TREATMENT
     *
     * The treatment assigned to every new group
     *
     * Accepted values:
     *
     *   - "treatment_rotate": rotates the treatments.
     *   - undefined: a random treatment will be selected.
     *   - function: a callback returning the name of the treatment. E.g:
     *
     *       function(treatments, roomCounter) {
     *           return treatments[num % treatments.length];
     *       }
     *
     */
    CHOSEN_TREATMENT: 'treatment_rotate',

    /**
     * ## PLAYER_SORTING
     *
     * Sorts the order of players before dispatching them
     *
     * This is called only if the number of connected players > GROUP_SIZE.
     *
     * Accepted values:
     *
     *   - 'timesNotSelected': (default) gives priority to players that
     *        have not been selected by a previous call to dispatch
     *   - undefined: rollback to default choice
     *   - null: no sorting (players are anyway randomly shuffled).
     *   - function: a comparator function implementing a criteria
     *       for sorting two objects. E.g:
     *
     *        function timesNotSelected(a, b) {
     *            if ((a.timesNotSelected || 0) < b.timesNotSelected) {
     *                return -1;
     *            }
     *            else if ((a.timesNotSelected || 0) > b.timesNotSelected) {
     *                return 1;
     *            }
     *            return 0;
     *        }
     */
    // PLAYER_SORTING: 'timesNotSelected',

    /**
     * ## PLAYER_GROUPING
     *
     * Creates groups of players to be assigned to treatments
     *
     * This method is alternative to "sorting" and will be invoked only
     * if the number of connected players > GROUP_SIZE
     *
     * @param {PlayerList} pList The list of players to group
     * @param {number} nGroups The number of groups requested by current
     *   dispatch
     *
     * @return {array} An array of nGroups arrays of player objects
     */
    PLAYER_GROUPING: function(pList, nGroups) {
        var groups;
        var properties;
        var i, len, subdb, lenSubdb, limit;
        var dbIdx, db2Idx;

        groups = [ [], [] ];
        db.importDB(pList.db);
        properties = Object.keys(db.key);

        dbIdx = 0, db2Idx = 1;
        i = -1, len = properties.length;
        for ( ; ++i < len ; ) {
            subdb = db.key[properties[i]];
            if (subdb) {
                lenSubdb = subdb.db.length;
                if (lenSubdb === 1) {
                    groups[db2Idx].push(subdb.db[0]);
                }
                else {
                    limit = Math.floor(lenSubdb/2);
                    groups[dbIdx] = groups[dbIdx]
                        .concat(subdb.db.slice(0, limit));
                    groups[db2Idx] = groups[db2Idx]
                        .concat(subdb.db.slice(limit));
                }

                // Group 2 takes an extra element, if size is odd.
                // Switch ids to rebalance.
                if (lenSubdb % 2 === 1) {
                    if (dbIdx === 1) {
                        dbIdx = 0;
                        db2Idx = 1;
                    }
                    else {
                        dbIdx = 1;
                        db2Idx = 0;
                    }
                }
            }
        }

        db.clear();
        return groups;
    },

    /**
     * ## DISCONNECT_IF_NOT_SELECTED
     *
     * Disconnect clients if not selected for a game when dispatching
     */
    DISCONNECT_IF_NOT_SELECTED: false,

    /**
     * ## ON_TIMEOUT
     *
     * A callback function to be executed when wait time expires
     */
    ON_TIMEOUT: function(data) {
        var timeOut;
        if (data.exit) {
            timeOut = "<br><br>Please report this exit code: " + data.exit;
            timeOut += "<br></h3>";
            this.bodyDiv.innerHTML += timeOut;
        }
    },

    /**
     * ## ON_TIMEOUT_SERVER
     *
     * A callback function to be executed on the server when wait time expires
     *
     * The context of execution is WaitingRoom.
     */
    ON_TIMEOUT_SERVER: function(code) {
       console.log('*** I am timed out! ', code.id);

        // TODO: save code.
    },

    /**
     * ## ON_DISCONNECT
     *
     * A callback function to be executed a player disconnects
     */
    ON_DISCONNECT: function(room, player) {
        var part1;
        if (room.numberOfDispatches < (NGAMES - 2)) return;
        if (room.getDispatchState() !== room.constructor.dispatchStates.NONE) {
            return;
        }
        part1 = room.channel.waitingRoom;
        if (!part1.part2Done) part1.ON_DISCONNECT(part1, player);
    },

    /**
     * ## ON_INIT
     *
     * A callback to be executed when the room is inited.
     */
    ON_INIT: function(room) {
        // If someone reconnects after 2 dispatches, notify
        // main waiting room so that the HIT can be closed (maybe).
        room.node.on.preconnect(function(p) {
            var part1;
            if (room.numberOfDispatches < (NGAMES - 2)) return;
            part1 = room.channel.waitingRoom;
            part1.ON_CONNECT(part1, p);
        });
    },

    /**
     * ## ON_INIT
     *
     * A callback to be executed after a dispatch call is ended
     */
    ON_DISPATCHED: function(room) {
        var waitRoom, part1;
        if (room.numberOfDispatches >= NGAMES) {
            part1 = room.channel.waitingRoom;
            if (!part1.hitExpired) {
                part1.expireHIT();
                part1.part2Done = true;
            }
        }
    },

    /**
     * ## PING_MAX_REPLY_TIME (number > 0) Optional
     *
     * The max number of milliseconds to wait for a reply from a PING
     *
     * Default: 3000
     *
     * @see PING_BEFORE_DISPATCH
     */
    // PING_MAX_REPLY_TIME: 3000,

    /**
     * ## PING_DISPATCH_ANYWAY (boolean) Optional
     *
     * If TRUE, dispatch continues even if disconnections occur during PING
     *
     * At least 1 player must be connected.
     *
     * Default: FALSE
     *
     * @see PING_BEFORE_DISPATCH
     * @see PING_MAX_REPLY_TIME
     */
    // PING_DISPATCH_ANYWAY: false

};
