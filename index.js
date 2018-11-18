//importa biblioteca express --
const express = require('express');
//importa biblioteca local --
const db = require('./db');

const server = express();

//permite o uso de json no express -- 
server.use(express.json());

//rota de isnserção do poste --
server.post('/inserir-poste', (request, response) => {
    const poste = request.body;
    db.inserirPoste(poste, (error) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send();
        }
    });
});

//rota de inserção da inspeção --
server.post('/inserir-inspecao', (request, response) => {
    const inspecao = request.body;
    db.inserirInspecao(inspecao, (error, inspecao) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send(inspecao);
        }
    });
});

//rota relatório 1
server.get('/postes-nao-inspecionados', (request, response) => {
    const intervalo = request.body;
    db.postesNaoInspecionados(intervalo, (error, postes) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send(postes);
        }
    });
});

//porta de conexão --
server.listen('8080', () => {
    console.log("Servidor rodando!")
});