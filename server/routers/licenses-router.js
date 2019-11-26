const {Router} = require(`express`);
const {check, validationResult} = require(`express-validator/check`);
const licensesStore = require(`../database/licenses-req.js`);
const dataStore = require(`../database/data-req.js`);
const bodyParser = require(`body-parser`);
const formParser = require(`connect-multiparty`);
const async = require(`../utils/async.js`);
const router = new Router();

/* Парсим тело запроса в формат json */
router.use(bodyParser.json());
const multiparty = formParser();

/* Возврат заголовков для кроссдоменного AJAX */
router.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Methods`, `*`);
  res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept, data`);
  next();
});

/* Запрос на получение списка лицензий */
router.get(`/`, async(async (req, res) => {
  const response = await licensesStore.getAll();
  res.send(await response.toArray());
}));

/* Запрос на добавление новой лицензии */
router.post(`/`, multiparty, [
  /*check(`name`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).escape(),
  check(`reduction`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).escape(),
  check(`sum`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).isInt().withMessage(`Only number`).escape()*/
], async(async (req, res) => {
  let errors = validationResult(req).errors;
  const checkName = await (await licensesStore.getToName(req.body.name));
  if (checkName) {
    errors.push({
      "value": req.body.name,
      "msg": `This name is busy`,
      "param": `name`,
      "location": `body`
    });
  }
  if (errors.length === 0) {
    const request = await licensesStore.save(req.body);
    const id = JSON.parse(request).insertedId;
    res.send(id);
  } else {
    res.status(400);
    res.send(errors);
  }
}));

/* Запрос на изменение лицензии по ее id */
router.put(`/`, multiparty, [
  /*check(`id`).trim().isLength({min: 24, max: 24}).withMessage(`Invalid id`).escape(),
  check(`name`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).escape(),
  check(`reduction`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).escape(),
  check(`sum`).trim().isLength({min: 5, max: 20}).withMessage(`length must be within 5-20`).isInt().withMessage(`Only number`).escape()*/
], async(async (req, res) => {
  let errors = validationResult(req).errors;
  if (errors.length === 0) {
    const checkId = await (await licensesStore.getToId(req.body.id));
    if (!checkId) {
      errors.push({
        "value": req.body.id,
        "msg": `Id is not found`,
        "param": `_id`,
        "location": `body`
      });
    }
    const checkName = await licensesStore.getToName(req.body.name);
    if (checkName && checkName._id.toString() !== req.body.id) {
      errors.push({
        "value": req.body.name,
        "msg": `This name is busy`,
        "param": `name`,
        "location": `body`
      });
    }
  }
  if (errors.length === 0) {
    const id = req.body.id;
    delete req.body.id;
    await licensesStore.update(id, req.body);
    res.send(`success`);
  } else {
    res.status(400);
    res.send(errors);
  }
}));

/* Запрос на удаление лицензии по ее id */
router.delete(`/`, [
  /*check(`id`).trim().isLength({min: 24, max: 24}).withMessage(`Invalid id`).escape()*/
], async(async (req, res) => {
  console.log(req.headers.data);
  const id = JSON.parse(req.headers.data).id;
  let errors = validationResult(req).errors;
  if (errors.length === 0) {
    const checkId = await (await licensesStore.getToId(id));
    if (checkId) {
      await dataStore.deleteLicense(id);
      await licensesStore.delete(id);
      res.send(`success`);
    } else {
      errors.push({
        "value": req.body.id,
        "msg": `Id is not found`,
        "param": `_id`,
        "location": `body`
      });
      res.status(404);
      res.send(errors);
    }
  } else {
    res.status(400);
    res.send(errors);
  }
}));

module.exports = router;
