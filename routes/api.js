const auth = require('basic-auth');
const express = require('express');
const User = require('../models/user');
const Entry = require('../models/entry');

exports.auth = (req, res, next) => {
    const {name, pass} = auth(req);
    User.authenticate(name, pass, (err, user) => {
        if (user) req.remoteUser = user;
        next(err);
    });
};

exports.user = (req, res, next) => {
    User.get(req.params.id, (err, user) => {
        if (err) return next(err);
        if (!user.id) return res.sendStatus(404);
        res.json(user); //json(user) will look for User.toJSON for an overide
    });
};

exports.entries = (req, res, next) => {
    const page = req.page;
    Entry.getRange(page.from, page.to, (err, entries) => {
        if(err) return next(err);
        res.format({
            json: () => { //short-hand for 'application/json': () => {
                res.json(entries);
            },
            xml: () => { //short-hand for 'application/xml': () =>
                res.render('entries/xml', { entries: entries});
            }
        });
    });
};
