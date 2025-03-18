const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql', 
});

sequelize.authenticate().then(function(){
    console.log("conectado com sucesso")
}).catch(function(error){ 
console.log("falha ao se conectar "+error)})
    
module.exports = {
    Sequelize : Sequelize,
    sequelize : sequelize
}
