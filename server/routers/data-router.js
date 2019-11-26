const {Router} = require(`express`);
const {check, body, validationResult} = require(`express-validator/check`);
const dataStore = require(`../database/data-req.js`);
const licensesStore = require(`../database/licenses-req.js`);
const bodyParser = require(`body-parser`);
const formParser = require(`connect-multiparty`);
const async = require(`../utils/async.js`);
const router = new Router();
const validation = require(`../utils/validation.js`);

/* Парсим тело запроса в формат json */
router.use(bodyParser.json());
const multiparty = formParser();

/* Возврат заголовков, для кроссдоменного AJAX */
router.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Methods`, `*`);
  res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept`);
  next();
});

const toPage = async (cursor, skip = 0, limit = 20) => {
  return {
    data: await (cursor.skip(skip).limit(limit).toArray()),
    skip,
    limit,
    total: await cursor.count()
  };
};

const formattingArray = (data, licenses) => {
  const formatArray = [];
  for (let i = 0; i < data.length; i++) {
    const newLicenses = [];
    for (let j = 0; j < licenses.length; j++) {
      for (let a = 0; a < data[i].licenses.length; a++) {
        if (data[i].licenses[a] === licenses[j]._id.toString()) {
          newLicenses.push(licenses[j]);
        }
      }
    }
    data[i].licenses = newLicenses;
    if (data[i].chief === `true`) {
      formatArray.push(data[i]);
      data.splice(i, 1);
      i--;
    }
  }
  for (let i = 0; i < formatArray.length; i++) {
    for (let j = 0; j < formatArray[i].links.length; j++) {
      for (let a = 0; a < data.length; a++) {
        if (formatArray[i].links[j] === data[a]._id.toString()) {
          formatArray[i].links[j] = data[a];
          data.splice(a, 1);
          a--;
        }
      }
    }
  }
  return formatArray;
};

/* Запрос на список данных клиентов.
* skip - количество пропущенных объектов, пагинация,
* limit - количество объектов в одном запросе,
* month - ограничение выборки по месяцам в поле data,
* sort - сортировка выборки по алфавиту в заданном поле,
* field - поиск по заданному полю, если значение 0 - то поиск не активен
* name - значение для поиска*/
router.get(`/`, async(async (req, res) => {
  let dataResponse = await dataStore.getAll();
  dataResponse = await dataResponse.toArray();
  let licensesResponse = await licensesStore.getAll();
  licensesResponse = await licensesResponse.toArray();
  const formatResponse = formattingArray(dataResponse, licensesResponse);
  res.send(formatResponse);
}));

/* Запрос на добавление нового клиента */
router.post(`/`, multiparty, async(async (req, res) => {
  const data = {};
  data.inn = ``;
  data.name = ``;
  data.date = ``;
  data.payment = `none`;
  data.dateColor = `none`;
  data.comments = [];
  data.rtp = `5`;
  data.tenzor = `10`;
  data.tax = `15`;
  data.contacts = [];
  data.licenses = [];
  data.links = [];
  data.chief = `true`;
  data.served = `candidate`;
  console.log(data);
  const request = await dataStore.save(data);
  const id = JSON.parse(request).insertedId;
  res.send(id);
}));

router.put(`/`, multiparty, [
  body(`[]`).custom((value, {req}) => {
    for (let key in req.body) {
      req.body[key] = validation(key, req.body[key]);
    }
    return true;
  })
  /*check(`id`).trim().isLength({min: 24, max: 24}).withMessage(`Invalid id`).escape(),
  check(`inn`).trim().custom(number).withMessage(`Only number`).escape(),
  check(`name`).trim().escape(),
  check(`rtp`).trim().custom(number).withMessage(`Only number`).escape(),
  check(`tenzor`).trim().custom(number).withMessage(`Only number`).escape(),
  check(`tax`).trim().custom(number).withMessage(`Only number`).escape(),
  check(`date`).trim().custom(date).withMessage(`Only date format dd.mm.yyyy`).escape()*/
], async(async (req, res) => {
  let errors = validationResult(req).errors;
  if (errors.length === 0) {
    const checkId = await (await dataStore.getToId(req.body.id));
    if (!checkId) {
      errors.push({
        "value": req.body.id,
        "msg": `Id is not found`,
        "param": `_id`,
        "location": `body`
      });
    }
    const checkName = await dataStore.getToName(req.body.name);
    if (checkName && checkName._id.toString() !== req.body.id) {
      errors.push({
        "value": req.body.name,
        "msg": `This name is busy`,
        "param": `name`,
        "location": `body`
      });
    }
  }
  if (req.body.served === `true`) {
    await dataStore.deleteField(req.body.id, {deleteMeta: `delete`});
  }
  if (errors.length === 0) {
    const id = req.body.id;
    delete req.body.id;
    /*for (let key in req.body) {
      if (req.body[key] === ``) {
        delete req.body[key];
      }
    }*/
    await dataStore.update(id, req.body);
    res.send(`success`);
  } else {
    res.status(400);
    res.send(errors);
  }
}));

router.delete(`/`, multiparty, [
  check(`id`).trim().isLength({min: 24, max: 24}).withMessage(`Invalid id`).escape(),
  check(`data`).escape(),
  check(`info`).escape()
], async(async (req, res) => {
  let errors = validationResult(req).errors;
  if (errors.length === 0) {
    const checkId = await (await dataStore.getToId(req.body.id));
    console.log(checkId);
    if (!checkId) {
      errors.push({
        "value": req.body.id,
        "msg": `Id is not found`,
        "param": `_id`,
        "location": `body`
      });
      res.status(404);
      res.send(errors);
    } else {
      const delInfo = {
        served: false,
        deleteMeta: {
          data: req.body.data,
          info: req.body.info
        }
      };
      await dataStore.update(req.body.id, delInfo);
      res.send(`success`);
    }
  } else {
    res.status(400);
    res.send(errors);
  }
}));

module.exports = router;
