const db = require(`./connect`);

/* Открытие соединения и получение коллекции */
const setupCollection = async () => {
  const dBase = await db;
  const collection = dBase.collection(`users`);
  collection.createIndex({name: -1}, {unique: true});
  return collection;
};

/* Класс с методами для запросов к бд */
class LicensesStore {
  constructor(collection) {
    this.collection = collection;
  }

  async getToName(data) {
    return (await this.collection).findOne({name: data}).catch((e) => e);
  }

  async save(data) {
    return (await this.collection).insertOne(data).catch((e) => e);
  }
}

module.exports = new LicensesStore(setupCollection()
  .catch((e) => {
    console.log(`Не удалось получить "licenses"-collection`, e);
  })
);
