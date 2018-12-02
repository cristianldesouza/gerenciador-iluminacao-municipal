//importa biblioteca express --
const express = require('express');

//importa biblioteca local "db" --
const db = require('./db');

//atribui o express na variável server --
const server = express();

//permite o uso de json no servidor -- 
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
    //atribui o objeto da inspeção em uma variavel
    const inspecao = request.body;
    //separa a data da inspeção em mês e ano
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
    const mes = request.query['mes'];
    const ano = request.query['ano'];
    db.saudeMensalIluminacao({mes, ano}, (error, nota) =>{
        if (error) {
            response.status(500).send();
        } else {
            response.send(nota);
        }
    });
});

//rota lista postes
server.get('/postes', (request, response) => {
    db.listaPostes((error, postes) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send(postes);
        }
    });
});

//rota relatório saúde iluminção
server.get('/relatorio-saude-iluminacao', (request, response) => {
    const inicialMes = +request.query['inicial-mes'];
    const inicialAno = +request.query['inicial-ano'];
    const finalMes = +request.query['final-mes'];
    const finalAno = +request.query['final-ano'];

    const inicial = {
        mes: inicialMes,
        ano: inicialAno
    };
    const final = {
        mes: finalMes,
        ano: finalAno
    };

    db.relatorioSaudeIluminacao({inicial, final}, (erro, relatorio) => {
        if (erro) {
            response.status(500).send();
        } else {
            response.send(relatorio);
        }
    });
});

//porta de conexão --
server.listen('8080', () => {
    console.log("Servidor rodando!")
});