'use strict';

import fs from 'fs';
import path from 'path';
import url from 'url';
import util from 'util';
import config from 'config';
import ipfsAPI from 'ipfs-api';
import CODE from '../lib/code';
import decompress from 'decompress';
import formidable from 'formidable';
import user from '../models/user';
import steem from '../models/steem';
import game from '../models/game';
import querystring from 'querystring';
import {SDKError} from '../errors/SDKError';
import {DBError} from '../errors/DBError';

exports.saveGame = async function(req, res, next) {
    try{
        console.log(req.body.data);
        let dbRes = await game.getGameById(req.params.id);
        if(typeof dbRes[0] === 'undefined') {
            return res.status(404).json({ resultCode: CODE.NOFOUND_GAME_ERROR.RESCODE, err: CODE.NOFOUND_GAME_ERROR.DESC });
        }
        console.log(dbRes);
        return res.status(200).json(dbRes[0]);
    } catch(err) {
        console.error(err);
        if (err instanceof DBError) {
            return res.status(500).json({ resultCode: CODE.DB_ERROR.RESCODE, err: err.description });
        } else {
            return res.status(500).json({ resultCode: CODE.ERROR.RESCODE, err:err.toString() });
        }
    }
};

