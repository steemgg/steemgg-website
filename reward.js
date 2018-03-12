'use strict';

import game from './api/models/game';
import db from './api/lib/db';
import steem from 'steem';
import async from 'async';

db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1)
  }
});

async function getReward(){
    try{
        let dbRes = await game.getPayoutActivities();
        steem.api.setOptions({url:'wss://steemd-int.steemit.com'});
        let conn = await db.getConn('write');
        let nums = Object.keys(dbRes).length;
        let i = 0;
        if (nums<=0) {
            console.log('no record!');
            process.exit(1)
        }
        conn.beginTransaction(async function(err) {
            if ( err ) {
                console.log(err);
                process.exit(1)
            }
            let sql = [];
            for(let k  in dbRes) {
                let result = await steem.api.getContentAsync(dbRes[k]['account'],dbRes[k]['permlink']);
                let payout = result.total_payout_value.split(' ');
                let sbd = payout[0];
                sql.push('update games set vote=vote+'+result.net_votes+', payout=payout+'+sbd+' where id= '+dbRes[k]['gameid']);
                sql.push('update activities set status=1,vote=vote+'+result.net_votes+', payout=payout+'+sbd+'  where id= '+ dbRes[k]['id']);
            }
            async.each(sql, function(item, callback) {
                conn.query(item, function(err, results) {
                    if(err) {
                        callback(err);
                    } else {
                        console.log(item + "success");
                        callback();
                    }
                });
            }, function(err) {
                conn.release();
                if(err) {
                    console.log(err);
                    conn.rollback(function() {
                        console.log('rollback!');
                        process.exit(1)
                    });
                } else {
                    conn.commit(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        console.log("all success");
                        process.exit()
                    });
                }
            });
        });
    } catch(e) {
        console.log(e);
        process.exit(1)
    }
}
getReward();
