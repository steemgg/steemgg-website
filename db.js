var mysql = require('mysql')
  , config = require('config')

var state = {
  pool: null,
}
exports.connect = function(done) {
    state.pool = mysql.createPoolCluster()

    state.pool.add('WRITE', {
        host: config.get('steemit.db.host'),
        user: config.get('steemit.db.dbUser'),
        password: config.get('steemit.db.dbPass'),
        database: config.get('steemit.db.dbName')
    })

    state.pool.add('READ1', {
        host: config.get('steemit.db.host'),
        user: config.get('steemit.db.dbUser'),
        password: config.get('steemit.db.dbPass'),
        database: config.get('steemit.db.dbName')
    })
    state.pool.add('READ2', {
        host: config.get('steemit.db.host'),
        user: config.get('steemit.db.dbUser'),
        password: config.get('steemit.db.dbPass'),
        database: config.get('steemit.db.dbName')
    })
    done()
}

exports.READ = 'read'
exports.WRITE = 'write'

function getConn(type) {
    return new Promise(( resolve, reject ) => {
        let pool = state.pool
        if (!pool) {
            reject(new Error('Missing database connection.'));
        } else {
            if (type === exports.WRITE) {
              state.pool.getConnection('WRITE', function (err, connection) {
                  if ( err ) {
                      reject( err )
                  } else {
                      resolve( connection )
                  }
              })
            } else {
                state.pool.getConnection('READ*', function (err, connection) {
                    if ( err ) {
                        reject( err )
                    } else {
                        resolve( connection )
                    }
                })
            }
        }
    });
}

exports.execute = async function(type, sql, params) {
    return new Promise( async ( resolve, reject ) => {
        let conn = await getConn(type);
        conn.query(sql, params, function (err, rows){
            conn.release(function(err){
                if ( err ) {
                    reject( err )
                }
            });
            if ( err ) {
                reject( err )
            } else {
                resolve( rows )
            }
        });
    });
}
