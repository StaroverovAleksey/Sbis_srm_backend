const {Router} = require(`express`);
const {check, validationResult} = require(`express-validator/check`);
const async = require(`../utils/async.js`);
const usersStore = require(`../database/users-req.js`);
const bodyParser = require(`body-parser`);
const formParser = require(`connect-multiparty`);
const router = new Router();
const bcrypt = require(`bcryptjs`);

/* Парсим тело запроса в формат json */
router.use(bodyParser.json());
const multiparty = formParser();

/* Возврат заголовков, для кроссдоменного AJAX */
router.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept`);
  next();
});

router.post(`/`, multiparty, [
  check(`name`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).escape(),
  check(`password`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).escape()
], async(async (req, res) => {
  let errors = validationResult(req).errors;
  const data = {};
  data.name = req.body.name;
  if (errors.length !== 0) {
    res.status(401);
    res.send(errors);
  } else {
    bcrypt.hash(req.body.password, 10).
    then(async (hash) => {
      data.pass = hash;
      const answer = await usersStore.save(data);
      switch (true) {
        case answer.code === 11000:
          res.status(400);
          res.send(`повтор имени`);
          break;
        case answer.code > 0 && answer.code !== 11000:
          res.sendStatus(527);
          break;
        default:
          res.sendStatus(205);
      }
    }).
    catch(() => res.sendStatus(528));
  }
}));

module.exports = router;
