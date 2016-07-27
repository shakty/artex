/**
 * # Authorization functions for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sets authorizations for accessing the Ultimatum channels.
 * ---
 */
module.exports = function(auth, settings) {


    // Creating an authorization function for the players.
    // This is executed before the client the PCONNECT listener.
    // Here direct messages to the client can be sent only using
    // his socketId property, since no clientId has been created yet.

    function authPlayers(channel, info) {

        var code, player, token;
        playerId = info.cookies.player;
        token = info.cookies.token;


        // Code not existing.
        if (!code) {
            console.log('not existing token: ', token);
            return false;
        }

        if (code.checkedOut) {
            console.log('token was already checked out: ', token);
            return false;
        }

        // Code in use.
        //  usage is for LOCAL check, IsUsed for MTURK
        if (code.valid === false) {
            if (code.disconnected) {
                return true;
            }
            else {
                console.log('token already in use: ', token);
                return false;
            }
        }

        // Client Authorized
        return true;
    }

    // Assigns Player Ids based on cookie token.
    function idGen(channel, info) {
        var cid = channel.registry.generateClientId();
        var cookies;
        var ids;

        // Return the id only if token was validated.
        // More checks could be done here to ensure that token is unique in ids.
        ids = channel.registry.getIds();
        cookies = info.cookies;
        if (cookies.player) {

            if (!ids[cookies.player] || ids[cookies.player].disconnected) {
                return cookies.player;
            }
            else {
                console.log("already in ids", cookies.player);
                return false;
            }
        }
    }

    function decorateClientObj(clientObject, info) {
        var amtData;
        if (info.handshake.headers) {
            clientObject.userAgent = info.handshake.headers['user-agent'];
        }
        if (info.query) {
            amtData = info.query.id;
            if (!info.query.id) {
                console.log('no amt data!', clientObject.id);
                return;
            }
            amtData = atob(info.query.id);
            if ('object' === typeof amtData) {
                clientObject.workerId = amtData.w;
                clientObject.assignmentId = amtData.a;
                clientObject.hitId = amtData.h;
            }
            else {
                clientObject.amtData = info.query.id;
            }
        }
    }

    // Assigning the auth callbacks to the player server.
    // auth.authorization('player', authPlayers);
    // auth.clientIdGenerator('player', idGen);
    auth.clientObjDecorator('player', decorateClientObj);

    // Decrypt base64 encoded strings.
    function atob(str) {
        str = new Buffer(str, 'base64').toString('binary');
        try {
            str = JSON.parse(str);
        }
        catch(e) {
            console.log(e);
            str = false;
        }
        return str;
    }
};
