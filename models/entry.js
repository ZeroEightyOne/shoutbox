const redis = require('redis');
const db = redis.createClient();

class Entry {
    constructor(obj) {
        for(let key in obj) {
            this[key] = obj[key]
        }
    }

    save(callback) {
        const entryJSON = JSON.stringify(this);
        db.lpush (
            'entries', entryJSON, (err) => {
                if (err) return callback(err);
                callback();
            }

        );
    }
    static getRange(from, to, callback) {
        db.lrange('entries', from, to, (err,items) => {
            if (err) return callback(err);
            let entries = [];
            items.forEach((item) => {
                entries.push(JSON.parse(item));
            });
            callback(null, entries);
        });
    }
    static count(cb) {
        db.llen('entries', cb);
    }
}

module.exports = Entry;