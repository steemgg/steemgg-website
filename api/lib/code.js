const CODE = {
    SUCCESS: {RESCODE:0,DESC:'success'},
    ERROR: {RESCODE:500,DESC:'error'},
    TEST_DATA_ERROR: {RESCODE:701,DESC:'get test data failed'},
    FILE_UPLOAD_ERROR: {RESCODE:702,DESC:'file upload failed'},
    NO_LOGIN_ERROR: {RESCODE:703,DESC:'must be connect steemit'},
    STEEMIT_API_ERROR: {RESCODE:704,DESC:'steemit api failed'},
    IPFS_ERROR: {RESCODE:705,DESC:'upload ipfs failed'},
    DB_ERROR: {RESCODE:706,DESC:'db error'},
    SESSION_ERROR: {RESCODE:707,DESC:'session error'},
    NO_AUDIT_ERROR: {RESCODE:708,DESC:'permission denied'},
    UPDATE_ERROR: {RESCODE:709,DESC:'update data failed'},
    POST_ERROR: {RESCODE:710,DESC:'post failed'},
    PARAMS_ERROR: {RESCODE:711,DESC:'params error'},
    VOTE_ERROR: {RESCODE:712,DESC:'vote failed'}
}

module.exports = CODE;
