'use strict';

const CODE = {
    SUCCESS: {RESCODE:0,DESC:'success'},
    ERROR: {RESCODE:500,DESC:'error'},
    //user
    NEED_LOGIN_ERROR: {RESCODE:100,DESC:'must connect steemit'},
    CLEAR_SESSION_ERROR: {RESCODE:101,DESC:'clear session failed'},
    PERMISSION_DENIED_ERROR: {RESCODE:102,DESC:'permission denied'},
    UNSET_AUDITOR_ERROR: {RESCODE:103,DESC:'unset auditor failed'},
    SET_AUDITOR_ERROR: {RESCODE:104,DESC:'set auditor failed'},

    //steem
    STEEMIT_API_ERROR: {RESCODE:200,DESC:'call steemit api failed'},

    //db 
    DB_ERROR: {RESCODE:300,DESC:'db error'},

    //post
    POST_INTERVAL_ERROR: {RESCODE:400,DESC:'post interval close'},
    COMMENT_INTERVAL_ERROR: {RESCODE:401,DESC:'comment interval close'},
    VOTE_INTERVAL_ERROR: {RESCODE:402,DESC:'vote interval close'},

    //game
    UPDATE_GAME_ERROR: {RESCODE:500,DESC:'update game failed'},
    DELETE_GAME_ERROR: {RESCODE:501,DESC:'delete game failed'},
    NOFOUND_GAME_ERROR: {RESCODE:502,DESC:'game not found'},
    NOFOUND_ACTIVITY_ERROR: {RESCODE:503,DESC:'activity not found'},
    HAS_REPORT_ERROR: {RESCODE:504,DESC:'this game has been reported'},
    NO_REPORT_ERROR: {RESCODE:504,DESC:'you have not reported this game'},

    //other
    TEST_DATA_ERROR: {RESCODE:700,DESC:'get test data failed'},
    FILE_UPLOAD_ERROR: {RESCODE:701,DESC:'file upload failed'},
    IPFS_ERROR: {RESCODE:702,DESC:'ipfs upload failed'},
    PARAMS_ERROR: {RESCODE:703,DESC:'params error'},
    PARAMS_INCONSISTENT_ERROR: {RESCODE:704,DESC:'inconsistent params'},
    FILE_TYPE_ERROR: {RESCODE:705,DESC:'incorrect file type'},
    FILE_MAX_SIZE_ERROR: {RESCODE:706,DESC:'exceeded file size'}
}

module.exports = CODE;
