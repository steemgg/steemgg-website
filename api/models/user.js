'use strict';

import config from 'config';
import db from '../../db';

exports.getUserByAccount = async function(account) {
    let rows = await db.execute(db.READ, 'select * from user where account = ?', account);
    return rows;
}

exports.addUser = async function(user) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO user SET ?', user);
    return rows;
}

