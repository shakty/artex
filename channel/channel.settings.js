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

    // name: 'mturk',

    alias: 'mturk',

    // playerServer: 'artex',

    // adminServer: 'artex/admin',

    verbosity: 1000,

    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,

    // Unauthorized clients will be redirected here.
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/artex/unauth.htm',

    enableReconnections: true

};
