/**
 * # Channels definition file for Art Exhibition Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Configurations options for channel.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // alias: 'mturk',

    // playerServer: 'artex',

    // adminServer: 'artex/admin',

    verbosity: 1,

    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,

    // Unauthorized clients will be redirected here.
    // (defaults: "/pages/accessdenied.htm")
    // accessDeniedUrl: '/unauth.htm',

    // If reconnections are enabled or not.
    enableReconnections: true,

    // If TRUE, only reconnections in the same game step are allowed.
    sameStepReconnectionOnly: false,

    // If TRUE, failed reconnections are disposed,
    // instead of being treated as a new connection.
    //
    // A reconnection can fail for the following reasones:
    //
    // - Parameter `enabledReconnections` is FALSE.
    // - Parameter `sameStepReconnectionOnly` is TRUE, and the
    //      client's stage and the logic's stage are different.
    // - The room in which the client was at the moment of
    //      disconnection cannot be located.
    // - Any other error.
    disposeFailedReconnections: true,


    // If set, resources in public/ will be cached (by the browser)
    // for the specified duration in milliseconds.
    cacheMaxAge: 360000,

    // If TRUE, it will be the default channel of the server.
    // And its static files will be served from '/'.
    // Socket.io connection must still be established to the
    // right endpoint.
    defaultChannel: true

};
