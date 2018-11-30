//importa biblioteca express --
const express = require('express');
//importa biblioteca local --
const db = require('./db');

const server = express();

//permite o uso de json no express -- 
server.use(express.json());

//servir arquivo estático --
server.use('/', express.static('public'));

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
    const mes = inspecao.data.split('-')[1];
    const ano = inspecao.data.split('-')[0];
    db.posteTemInspecaoNoMes({etiqueta: inspecao.posteEtiqueta, mes, ano}, (erro, resultado) => {
        if (erro) {
            response.status(500).send();
        } else {
            if (resultado) {
                response.status(409).send();
            } else {
                db.inserirInspecao(inspecao, (error, inspecao) => {
                    if (error) {
                        response.status(500).send();
                    } else {
                        response.send(inspecao);
                    }
                });
            }
        }
    });
    
});

//rota relatório 1
server.get('/postes-nao-inspecionados', (request, response) => {
    const dataInicial = request.query['data-inicial'];
    const dataFinal = request.query['data-final'];
    const intervalo = { dataInicial, dataFinal };
    db.postesNaoInspecionados(intervalo, (error, postes) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send(postes);
        }
    });
});

//rota relatório 2
server.get('/saude-iluminacao', (request, response) => {
    
});

//porta de conexão --
server.listen('8080', () => {
    console.log("Servidor rodando!")
});