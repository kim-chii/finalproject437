var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Mvs';

router.get('/', function (req, res) {
   var owner = req.query.owner;
   var qry = 'select * from Movie';
   var params = null;

   if (owner) {
      qry += ' where ownerId = ?';
      params = owner;
   }

   req.cnn.chkQry(qry, params, function (err, cnvs) {
      if (!err) {
         res.json(cnvs)
      }
      req.cnn.release()
   });
});

router.post('/', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   body["ownerId"] = req.session.id;

   async.waterfall([
       function (cb) {
          if (vld.hasFields(body, ["title", "director", "releaseYear"], cb) &&
           vld.check(req.body.title.length <= 80, Tags.badValue,
            ['title'], cb)) {
             cnn.chkQry('select * from Movie where title = ? and ' +
              ' director = ? and releaseYear = ?',
              [body.title, body.director, parseInt(body.releaseYear)], cb);
          }
       },
       function (existingCnv, fields, cb) {
          if (vld.check(!existingCnv.length, Tags.dupEntry, null, cb))
             cnn.chkQry("insert into Movie set ?", body, cb);
       },
       function (insRes, fields, cb) {
          res.location(router.baseURL + '/' + insRes.insertId).end();
          cb();
       }],
    function (err) {
       cnn.release();
    });
});

router.get('/:mvId', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var mvId = req.params.mvId;

   async.waterfall([
       function (cb) {
          cnn.chkQry('select * from Movie where id = ?', [mvId], cb);
       },
       function (mvs, fields, cb) {
          if (vld.check(mvs.length, Tags.notFound, null, cb)) {

             res.json({
                id: mvs[0].id, title: mvs[0].title, genre: mvs[0].genre,
                director: mvs[0].director, releaseYear: mvs[0].releaseYear,
                ownerId: mvs[0].ownerId
             });
             cb();
          }
       }],
    function (err) {
       if (!err)
          res.status(200).end();
       req.cnn.release();
    });
});

router.put('/:mvId', function (req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var mvId = req.params.mvId;

   async.waterfall([
       function (cb) {
          cnn.chkQry('select * from Movie where id = ?', [mvId], cb);
       },
       function (mvs, fields, cb) {
          if (vld.check(mvs.length, Tags.notFound, null, cb) &&
           vld.checkPrsOK(mvs[0].ownerId, cb)) {
             var query = 'select * from Movie where id <> ? && title = ? ' +
              '&& director = ? && releaseYear = ?';
             var params = [mvId];

             params.push(body.title ? body.title : mvs[0].title);
             params.push(body.director ? body.director : mvs[0].director);
             params.push(body.releaseYear ?
              body.releaseYear : mvs[0].releaseYear);

             cnn.chkQry(query, params, cb);
          }
       },
       function (sameTtl, fields, cb) {
          if (vld.check(!sameTtl.length, Tags.dupEntry, null, cb))
             cnn.chkQry("update Movie set ? where id = ?",
              [body, mvId], cb);
       },
       function (qRes, fields, cb) {
          res.status(200).end();
          cb();
       }],
    function (err) {
       req.cnn.release();
    });
});

router.delete('/:mvId', function (req, res) {
   var vld = req.validator;
   var mvId = req.params.mvId;
   var cnn = req.cnn;

   async.waterfall([
       function (cb) {
          cnn.chkQry('select * from Movie where id = ?', [mvId], cb);
       },
       function (mvs, fields, cb) {
          if (vld.check(mvs.length, Tags.notFound, null, cb) &&
           vld.checkPrsOK(mvs[0].ownerId, cb))
             cnn.chkQry('delete from Movie where id = ?', [mvId], cb);
       }],
    function (err) {
       if (!err)
          res.status(200).end();
       req.cnn.release();
    });
});

router.get('/:mvId/Rvws', function (req, res) {
   var vld = req.validator;
   var mvId = req.params.mvId;
   var cnn = req.cnn;


   async.waterfall([
       function (cb) {  // Check for existence of conversation
          cnn.chkQry('select * from Movie where id = ?', [mvId], cb);
       },
       function (movie, fields, cb) {
          if (vld.check(movie.length, Tags.notFound, null, cb))
             cnn.chkQry('select id, username, score, content, postedOn' +
              ' from Review where mvId = ?', [mvId], cb);
       },
       function (rvws, fields, cb) {
          rvws.forEach(function (review) {
             review.postedOn = new Date(review.postedOn).getTime();
          });
          res.json(rvws);
          cb();
       }],
    function (err) {
       req.cnn.release();
    });
});

router.post('/:mvId/Rvws', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var mvId = req.params.mvId;
   var username = req.session.email;

   async.waterfall([
       function (cb) {
          cnn.chkQry('select * from Movie where id = ?', [mvId], cb);
       },
       function (movie, fields, cb) {
          if (vld.check(movie.length, Tags.notFound, null, cb)) {
             cnn.chkQry('select * from Review where username = ? && mvId = ?',
              [username, mvId], cb);
          }
       },
       function (review, fields, cb) {
          if (vld.chain(!review.length, Tags.dupReview, null, cb) &&
           vld.check(req.body.hasOwnProperty("content"), Tags.missingField,
            ['content'], cb) &&
           vld.check(req.body.content.length <= 5000, Tags.badValue,
            ['content'], cb) &&
           vld.check(req.body.hasOwnProperty("score"), Tags.missingField,
            ['score'], cb) &&
           vld.check(req.body.score > 0 && req.body.score < 6, Tags.badValue,
            ['score'], cb))
             cnn.chkQry('insert into Review set ?',
              {
                 mvId: mvId, username: username, postedOn: new Date(),
                 content: req.body.content, score: req.body.score
              }, cb);
       },
       function (insRes, fields, cb) {
          res.location('/Rvws/' + insRes.insertId).end();
          cb();
       }],
    function (err) {
       req.cnn.release();
    });
});

module.exports = router;
