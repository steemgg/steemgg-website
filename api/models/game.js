const db = require('../../db')

exports.addGame = function(game, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('INSERT INTO games SET ?', game, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.deleteGame = function(params, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('update games set status = 3 where id= ? and userid= ?', params, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.updateGame = function(params, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('update games set ? where id= ? and userid= ?', params, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.auditGame = function(params, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('update games set status=? where id= ?', params, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.reportGame = function(params, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('update games set report=? where id= ?', params, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.getGameById = function(gameId, cb) {
    db.get(db.READ, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

        connection.query('select * from games where id=?', gameId, function (err, rows) {
            if (err) return cb(err)
            cb(null, rows)
        })
    })
}

exports.getActivitiesById = function(gameId, cb) { 
    db.get(db.READ, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

        connection.query('select * from games where id=?', gameId, function (err, rows) {
            if (err) return cb(err)
            cb(null, rows)
        })
    })
}

exports.addActivity = function(activity, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('INSERT INTO activities SET ?', activity, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.getRecentlyActivity = function(gameId, cb) {
    db.get(db.READ, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

        connection.query('select * from activities where gameid=? order by lastModified desc limit 1', gameId, function (err, rows) {
            if (err) return cb(err)
            cb(null, rows)
        })
    })
}

exports.query = function(sql, params, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query(sql, params, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}
