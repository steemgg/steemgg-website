const config = require('config');
const db = require('../../db')

exports.getUserByAccount = function(account, cb) {
  db.get(db.READ, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})

    connection.query('select * from user where account = ?', account, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

exports.addUser = function(user, cb) {
  db.get(db.WRITE, function(err, connection) {
    if (err) return cb({code:"Missing database connection"})
    connection.query('INSERT INTO user SET ?', user, function (err, rows) {
      if (err) return cb(err)
      cb(null, rows)
    })
  })
}

