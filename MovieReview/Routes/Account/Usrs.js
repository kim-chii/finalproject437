var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Usrs';

router.get('/', function (req, res) {
   var isAdmin = req.session.isAdmin();
   var request = req.query.email;

   var handler = function (err, usrArr) {
      res.json(usrArr);
      req.cnn.release();
   };

   if (!request) {
      if (isAdmin)
         req.cnn.chkQry('select id, email from User', null, handler);
      else
         req.cnn.chkQry('select id, email from User where email = ?',
          [req.session.email], handler);
   } else {
      if (isAdmin)
         req.cnn.chkQry('select id, email from User where email like ?',
          [request + '%'], handler);
      else
         req.cnn.chkQry('select id, email from User where email like ? ' +
          'and id = ?', [request + '%', req.session.id], handler);
   }

});

router.post('/', function (req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.password)
      body.password = "*";                       // Blocking password
   body.whenRegistered = new Date();

   async.waterfall([
       function (cb) { // Check properties and search for Email duplicates
          if (vld.hasFields(body, ["email", "lastName", "password", "role"],
            cb) &&
           vld.chain(body.role === 0 || admin, Tags.noPermission)
            .chain(body.termsAccepted || admin, Tags.noTerms)
            .check(body.role === 0 || body.role === 1, Tags.badValue,
             ["role"], cb)) {
             cnn.chkQry('select * from User where email = ?',
              body.email, cb);
          }
       },
       function (existingUsrs, fields, cb) {  // If no duplicates, in
          if (vld.check(!existingUsrs.length, Tags.dupEmail, null, cb)) {
             body.termsAccepted = body.termsAccepted ? new Date() : null;
             cnn.chkQry('insert into User set ?', body, cb);
          }
       },
       function (result, fields, cb) { // Return location of inserted User
          res.location(router.baseURL + '/' + result.insertId).end();
          cb();
       }],
    function () {
       cnn.release();
    });
});


router.get('/:id', function (req, res) {
   var vld = req.validator;

   if (vld.checkUsrOK(req.params.id)) {
      req.cnn.query('select email, firstName, lastName, role, termsAccepted'
       + ', id, whenRegistered from User where id = ?', [req.params.id],
       function (err, usrArr) {
          if (vld.check(usrArr.length, Tags.notFound))
             res.json(usrArr);
          req.cnn.release();
       });
   }
   else {
      req.cnn.release();
   }
});

router.put('/:id', function (req, res) {
   var body = req.body;
   var vld = req.validator;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   async.waterfall([
       function (cb) {

          if (vld.checkUsrOK(req.params.id, cb) &&
           vld.chain(!("termsAccepted" in body), Tags.forbiddenField,
            ["termsAccepted"], cb) &&
           vld.check(!("whenRegistered" in body), Tags.forbiddenField,
            ["whenRegistered"], cb) &&
           vld.hasOnlyFields(body,
            ["firstName", "lastName", "password", "oldPassword", "role"],
            cb) &&
           //If body has a pw, check for old pw, if no old pw, check for admin
           vld.chain(!body.hasOwnProperty("password") || body.oldPassword
            || admin, Tags.noOldPwd, null, cb)
            .chain(body.password !== "", Tags.badValue, ["password"], cb)
            .check(!body.role || admin, Tags.badValue, ["role"], cb)) {
             //cb is next function in waterfall
             cnn.chkQry("select * from User where id = ?", [req.params.id],
              cb);
          }
       },
       //qRes is the expected result, fields are the column names
       function (qRes, fields, cb) {
          //Use 2 checks because we want the previous check
          // result before 2nd check
          if (vld.check(qRes.length, Tags.notFound, null, cb) &&
           //If not admin, if put in new password, check for old pw
           vld.check(admin || !body.password ||
            qRes[0].password === body.oldPassword, Tags.oldPwdMismatch,
            null, cb)) {
             //Assumes each value in body is a database column
             delete body.oldPassword;
             cnn.chkQry("update User set ? where id = ?",
              [body, req.params.id], cb);
             //If we return 200, before
             //res.status(200).end();
             //cb();
          }
       },
       function (qRes, fields, cb) {
          res.status(200).end();
          cb();
       }],
    function (err) {
       req.cnn.release();
    });
});

router.get('/Rvws/:usrId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var query1 = 'select email from User where id = ?';
   var query2 = 'select id, mvId, username, score, content, postedOn' +
    ' from Review where username = ?';

   async.waterfall([
      function(cb) {
         cnn.chkQry(query1, [req.params.usrId], cb);
      },
      function(email, fields, cb) {
         if (vld.check(email.length, Tags.notFound, null, cb)) {
            cnn.chkQry(query2, [email[0].email], cb);
         }
      },
      function(reviews, fields, cb) {
         res.json(reviews);
         cb();
      }
   ],
    function(err) {
      cnn.release();
    });
});

router.delete('/:id', function (req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var usrsId = req.params.id;

   async.waterfall([
       function (cb) {
          cnn.chkQry('select * from User where id = ?', [usrsId], cb);
       },
       function (usr, fields, cb) {
          if (vld.check(usr.length, Tags.notFound, null, cb) &&
           vld.checkUsrOK(-1, cb))
             cnn.chkQry('delete from User where id = ?', [usrsId], cb);
       }],
    function (err) {
       if (!err)
          res.status(200).end();
       req.cnn.release();
    });
});

module.exports = router;
