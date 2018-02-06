import db from '../../db'

exports.addGame = async function(game) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO games SET ?', game);
    return rows;
}

exports.deleteGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set status = 3 where id= ? and userid= ?', params);
    return rows;
}

exports.updateGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set ? where id= ? and userid= ?', params);
    return rows;
}

exports.auditGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set status=? where id= ?', params);
    return rows;
}

exports.reportGame = async function(params) {
    let rows = await db.execute(db.WRITE, 'update games set report=? where id= ?', params);
    return rows;
}

exports.getGameById = async function(gameId) {
    let rows = await db.execute(db.READ, 'select * from games where id=?', gameId);
    return rows;
}

exports.getActivitiesById = async function(gameId) {
    let rows = await db.execute(db.READ, 'select * from activities where gameid=?', gameId);
    return rows;
}

exports.addActivity = async function(activity) {
    let rows = await db.execute(db.WRITE, 'INSERT INTO activities SET ?', activity);
    return rows;
}

exports.getRecentlyActivity = async function(gameId) {
    let rows = await db.execute(db.READ, 'select * from activities where gameid=? order by lastModified desc limit 1', gameId);
    return rows;
}

exports.query = async function(sql, params) {
    let rows = await db.execute(db.WRITE, sql, params);
    return rows;
}
