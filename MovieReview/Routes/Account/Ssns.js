var Express = require('express');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var router = Express.Router({caseSensitive: true});

router.baseURL = '/Ssns';

router.get('/', function(req, res) {
   var body = [], ssn;

   console.log('GET: /Ssns');

   if (req.validator.checkAdmin()) {
      for (var cookie in ssnUtil.sessions) {
         ssn = ssnUtil.sessions[cookie];
         body.push({cookie: cookie, usrId: ssn.id, loginTime: ssn.loginTime});
      }
      res.status(200).json(body);
   }
   req.cnn.release();
});

router.post('/', function(req, res) {
   var cookie;
   var cnn = req.cnn;

   console.log('POST: /Ssns');

   cnn.query('select * from User where email = ?', [req.body.email],
    function (err, result) {
       if (req.validator.check(result.length && result[0].password ===
         req.body.password, Tags.badLogin)) {
          cookie = ssnUtil.makeSession(result[0], res);
          res.location(router.baseURL + '/' + cookie).status(200).end();
       }
       cnn.release();
    });
});

router.delete('/:cookie', function(req, res, next) {
   var cookie = req.cookies[ssnUtil.cookieName];
   var role = ssnUtil.sessions[cookie].role;

   console.log('DELETE: /Ssns/:cookie');

   if (req.validator.check(req.params.cookie === cookie || role === 1,
     Tags.noPermission)) {
      ssnUtil.deleteSession(req.params.cookie);
      res.status(200).end();
   }
   req.cnn.release();
});

router.get('/:cookie', function(req, res, next) {
   var cookie = req.params.cookie;
   var vld = req.validator;

   console.log('GET /Ssns/:cookie');

   if (vld.check(ssnUtil.sessions[cookie], Tags.notFound) &&
    vld.checkUsrOK(ssnUtil.sessions[cookie].id)) {
      res.json({
         cookie: cookie, usrId: req.session.id,
         loginTime: req.session.loginTime
      });
   }
   req.cnn.release();
});

module.exports = router;
