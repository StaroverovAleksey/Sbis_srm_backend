/* Модуль, открывающий соединение с базой данных */
const {MongoClient} = require(`mongodb`);

const HOSTNAME = process.env.DB_HOST || `localhost`;
const PORT = parseInt(process.env.DB_PORT, 10) || 27017;
const url = `mongodb://${HOSTNAME}:${PORT}`;

const dbName = `crm`;

module.exports = MongoClient.connect(url)
  .then((client) => {
    console.log(`Соединение с базой данный успешно установлено`);
    return client.db(dbName);
  }).catch((e) => {
    console.log(`Ошибка соединения с базой данных: `, e);
    process.exit(1);
  });
