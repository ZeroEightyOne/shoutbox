const redis = require('redis');
const bcrypt = require('bcrypt');
const db = redis.createClient();

class User {
    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }
    static getByName(name,callback) {
        User.getId(name,(err,id) => {
            if (err) return callback(err);
            User.get(id,callback);
        });
    }
    static getId(name, callback){
        db.get(`user:id:${name}`,callback);
    }

    static get(id,callback) {
        db.hgetall(`user:${id}`, (err,user) => {
            if(err) return callback(err);
            callback(null, new User(user));
        });
    }
    static authenticate(name, pass, callback) {
        User.getByName(name, (err, user) => {
            if (err) return callback(err);
            if(!user.id) return callback();
            bcrypt.hash(pass, user.salt, (err, hash) => {
                if(err) return callback(err);
                if(hash == user.pass) return callback(null, user);
                callback();
            });
        });
    }
    save(callback) {
        if(this.id) {
            this.update(callback);
        } else {
            db.incr('user:ids',(err,id) => {
                if(err) return callback(err);
                this.id = id;
                this.hashPassword((err) => {
                    if(err) return callback(err);
                    this.update(callback);
                });
            });
        }
    }
    update(callback) {
        const id = this.id;
        db.set(`user:id:${this.name}`,id,(err) => {
            if(err) return callback(err);
            db.hmset(`user:${id}`, this, (err) => {
                callback(err);
            });
        });
    }
    hashPassword(callback) {
        bcrypt.genSalt(12, (err,salt) => {
            if (err) return callback(err);
            this.salt = salt;
            bcrypt.hash(this.pass, salt, (err,hash) => {
                if (err) return callback(err);
                this.pass = hash;
                callback();
            });
        });
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }
}

module.exports = User;
