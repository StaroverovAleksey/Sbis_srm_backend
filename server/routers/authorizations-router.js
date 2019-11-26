const {Router} = require(`express`);
const {check, validationResult} = require(`express-validator/check`);
const async = require(`../utils/async.js`);
const usersStore = require(`../database/users-req.js`);
const formParser = require(`connect-multiparty`);
const router = new Router();
const bcrypt = require(`bcryptjs`);
const jwt = require(`jwt-simple`);
const config = `ihHiLbYTxWEbCyOpVRjlD`;

/* Парсер тела запроса */
const multiparty = formParser();

/* Возврат заголовков, для кроссдоменного AJAX */
router.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept`);
  next();
});

router.post(`/`, multiparty, [
  check(`name`).trim().escape(),
  check(`password`).trim().escape()
], async(async (req, res) => {
  let errors = validationResult(req).errors;
  const answer = await usersStore.getToName(req.body.name);
  if (answer) {
    bcrypt.compare(req.body.password, answer.pass, function (err, valid) {
      if (err) {
        res.sendStatus(500);
      }
      if (!valid) {
        errors.push({
          "value": req.body.password,
          "msg": `This password is not valid`,
          "param": `password`,
          "location": `body`
        });
        res.status(400);
        res.send(errors);
      } else {
        const token = jwt.encode({name: answer.name}, config);
        res.status(200);
        res.send(token);
      }
    });
  } else {
    errors.push({
      "value": req.body.name,
      "msg": `This name is not found`,
      "param": `name`,
      "location": `body`
    });
  }
  if (errors.length !== 0) {
    res.status(400);
    res.send(errors);
  }
}));

module.exports = router;
