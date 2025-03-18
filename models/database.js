const { Sequelize } = require('sequelize');

// Ou usando a URL diretamente:
const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

sequelize.authenticate()
  .then(() => console.log("Conectado ao MySQL no Railway com sucesso!"))
  .catch(error => console.log("Falha na conexão: " + error));

module.exports = {
  Sequelize: Sequelize,
  sequelize: sequelize
};