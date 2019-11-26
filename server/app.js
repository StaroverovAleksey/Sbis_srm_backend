const express = require(`express`);
const dataRouter = require(`./routers/data-router.js`);
const usersRouter = require(`./routers/users-router.js`);
const licensesRouter = require(`./routers/licenses-router.js`);
const authorizationRouter = require(`./routers/authorizations-router.js`);

const app = express();
app.use(express.static(`./`));
app.use(`/api/data`, dataRouter);
app.use(`/api/users`, usersRouter);
app.use(`/api/licenses`, licensesRouter);
app.use(`/api/authorizations`, authorizationRouter);

const HOSTNAME = process.env.SERVER_HOST || `localhost`;
const PORT = parseInt(process.env.SERVER_PORT, 10) || 80;
const serverAddress = `http://${HOSTNAME}:${PORT}`;

module.exports = {
  run() {
    app.listen(PORT, HOSTNAME, () => {
      console.log(`Сервер запущен по адресу: ${serverAddress}/`);
    });
  }
};
