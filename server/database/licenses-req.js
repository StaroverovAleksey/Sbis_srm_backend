const db = require(`./connect`);
const objectId = require(`mongodb`).ObjectID;

/* Открытие соединения и получение коллекции */
const setupCollection = async () => {
  const dBase = await db;
  const collection = dBase.collection(`licenses`);
  collection.createIndex({name: -1}, {unique: true});
  return collection;
};

/* Класс с методами для запросов к бд */
class LicensesStore {
  constructor(collection) {
    this.collection = collection;
  }

  async getToName(data) {
    return (await this.collection).findOne({name: data});
  }

  async getToId(data) {
    return (await this.collection).findOne({_id: objectId(data)});
  }

  async getAll() {
    return (await this.collection).find().sort({"name": 1});
  }

  async save(data) {
    return (await this.collection).insertOne(data);
  }

  async update(id, data) {
    return (await this.collection).findOneAndUpdate({_id: objectId(id)}, {$set: data});
  }

  async delete(data) {
    return (await this.collection).deleteOne({_id: objectId(data)});
  }
}

module.exports = new LicensesStore(setupCollection()
    .catch((e) => {
      console.log(`Не удалось получить "licenses"-collection`, e);
    })
);
