const { Sequelize } = require('sequelize');

// Use a variável de ambiente correta, que é MYSQL_URL
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
    .then(() => console.log("✅ Conectado com sucesso ao banco!"))
    .catch(error => console.log("❌ Falha ao conectar: " + error));

module.exports = { Sequelize, sequelize };
