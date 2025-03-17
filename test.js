require('dotenv').config(); // Carrega variáveis do .env

console.log("Token do Mapbox:", process.env.MAPBOX_ACCESS_TOKEN); // ✅ Testa se o token foi carregado

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
