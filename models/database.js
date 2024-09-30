const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('saudeurgente', 'clifford', '40028922', {
    host: 'localhost',
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
