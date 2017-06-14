var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Rvws';

router.get('/:revId', function(req, res) {
   var vld = req.validator;

   console.log('GET: /Rvws/:revId');

   async.waterfall([
       function(cb) {
          req.cnn.chkQry('select id, username, score, content, postedOn' +
           ' from Review where id = ?',
           [req.params.revId], cb);
       },
       function(review, fields, cb) {
          if (vld.check(review.length, Tags.notFound, null, cb)) {
             res.location(router.baseURL + '/' + review[0].id);
             res.json(review[0]);
             cb();
          }
       }],
    function(err) {
       req.cnn.release();
    });
});

router.put('/:revId', function(req, res) {
   var vld = req.validator;

   console.log('PUT: /Rvws/:revId');

   async.waterfall([
       function(cb) {
          req.cnn.chkQry('select * from Review where id = ?',
           [req.params.revId], cb)
       },
       function(review, fields, cb) {
          if (vld.check(review.length, Tags.notFound, null, cb)) {
             req.cnn.chkQry('select * from User where email = ?',
              [review[0].username], cb)
          }
       },
       function(user, fields, cb) {
          if (vld.checkUsrOK(user[0].id, cb)) {
             if (vld.check(req.body.hasOwnProperty("content"),
               Tags.missingField, ['content'], cb) &&
              vld.check(req.body.content.length <= 5000, Tags.badValue,
               ['content'], cb) &&
              vld.check(req.body.hasOwnProperty("score"), Tags.missingField,
               ['score'], cb) &&
              vld.check(req.body.score > 0 && req.body.score < 6, Tags.badValue,
               ['score'], cb))
                req.cnn.chkQry('update Review set ? where id = ?',
                 [{content: req.body.content, score: req.body.score},
                    req.params.revId], cb);
          }
       },
       function(qRes, fields, cb) {
          res.status(200).end();
          cb();
       }],
    function(err) {
       req.cnn.release();
    })
});

router.get('/:revId/Sentiment', function(req, res) {
   var vld = req.validator;
   var revId = req.params.revId;

   console.log('GET: /Rvws/:revId/Sentiment');

   async.waterfall([
       function(cb) {
          req.cnn.chkQry('select * from Sentiment where revId = ?', [revId], cb)
       },
       function(likes, fields, cb) {
          res.json(likes);
          cb();
       }
    ],
    function(err) {
       req.cnn.release();
    });

});

router.post('/:revId/Sentiment', function(req, res) {
   var vld = req.validator;
   var revId = req.params.revId;
   var sentiment = req.body.sentiment;

   console.log('POST: /Rvws/:revId/Sentiment');

   async.waterfall([
       function(cb) {
          req.cnn.chkQry("select * from Review where id = ?", [revId], cb);
       },
       function(review, fields, cb) {
          if (vld.check(review.length, Tags.notFound, null, cb)) {
             req.cnn.chkQry('select * from Sentiment where revId = ? ' +
              '&& username = ?', [revId, req.session.email], cb)
          }
       },
       function(prevSentiments, fields, cb) {
          if (vld.check(!prevSentiments.length, Tags.dupEntry, null, cb)) {
             req.cnn.chkQry('insert into Sentiment set ?', {
                revId: revId, username: req.session.email, sentiment: sentiment
             }, cb)
          }
       },
       function(insRes, fields, cb) {
          res.location(router.baseURL + '/' + insRes.insertId).end();
          cb();
       }
    ],
    function(err) {
       req.cnn.release()
    });
});

router.delete('/:revId/Sentiment/:sntId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var sntId = req.params.sntId;

   console.log('DELET: /Rvws/:revId/Sentiment/:sntId');

   async.waterfall([
       function(cb) {
          cnn.chkQry('select User.id from User, Sentiment ' +
           'where Sentiment.id = ? && User.email = Sentiment.username',
           [sntId], cb)
       },
       function(user, fields, cb) {
          if (vld.check(user.length, Tags.notFound, null, cb)
           && vld.checkUsrOK(user[0].id, cb)) {
             cnn.chkQry('delete from Sentiment where id = ?', [sntId], cb);
          }
       }],
    function(err) {
       if (!err)
          res.status(200).end();
       req.cnn.release();
    });

});
module.exports = router;
