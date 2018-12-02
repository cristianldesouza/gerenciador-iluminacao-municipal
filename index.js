//importa biblioteca express, que gera o servidor --
const express = require('express');

//importa biblioteca local "db" que se comunica com o banco --
const db = require('./db');

//atribui o express na variável server --
const server = express();

//permite o uso de json no servidor -- 
server.use(express.json());

//defini o uso de arquivos estáticos no servidor --
server.use('/', express.static('public'));

//rota de isnserção do poste no banco --
server.post('/inserir-poste', (request, response) => {
    // quando a requisição é feita, o poste é passado como um objeto json, que é atribuido a variável poste --
    const poste = request.body;

    // chama a função que está dentro da da biblioteca db, que faz a inserção do poste no banco --
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
    //atribui o objeto da inspeção que vem na requisição, em uma variavel --
    const inspecao = request.body;
    //separa a data da inspeção em mês e ano --
    const mes = inspecao.data.split('-')[1];
    const ano = inspecao.data.split('-')[0];

    // chama a função do banco que verifica se o poste já tem inspeção no mês solicitado --
    db.posteTemInspecaoNoMes({etiqueta: inspecao.posteEtiqueta, mes, ano}, (erro, resultado) => {
        if (erro) {
            //caso a requisição falhe, retorna erro 500 --
            response.status(500).send();
        } else {
            if (resultado) {
                // caso o poste já tenha inspeção no mês, retorna o erro 409 --
                response.status(409).send();
            } else {
                // caso o poste não tenhs inspeção no mês solicitado, chama a função do banco que insere a inepeção --
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

//rota lista postes --
server.get('/postes', (request, response) => {
    // função no banco que faz o select nos postes é chamada --
    db.listaPostes((error, postes) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send(postes);
        }
    });
});



//rota para gerar relatório 1
server.get('/postes-nao-inspecionados', (request, response) => {
    // os valores necessários para gerar o relatórios que estão no corpo da requisição são colocados em variáveis --
    const dataInicial = request.query['data-inicial'];
    const dataFinal = request.query['data-final'];
    // as duas datas sao atribuidas a um objeto --
    const intervalo = { dataInicial, dataFinal };
    // a função que gera o relatório no banco é chamada --
    db.postesNaoInspecionados(intervalo, (error, postes) => {
        if (error) {
            response.status(500).send();
        } else {
            response.send(postes);
        }
    });
});

//rota para gerar o relatório 2 --
server.get('/saude-iluminacao', (request, response) => {
    // mes e ano que vem na requisição são atribuidos em variáveis --
    const mes = request.query['mes'];
    const ano = request.query['ano'];
    // função do banco que faz o select do relatório é chamada --
    db.saudeMensalIluminacao({mes, ano}, (error, nota) =>{
        if (error) {
            response.status(500).send();
        } else {
            response.send(nota);
        }
    });
});


//rota relatório saúde iluminção --
server.get('/relatorio-saude-iluminacao', (request, response) => {
    // informações no rospo da requisição são atribuidos a variaveis, o + na frente delas torna a string em numérico --
    const inicialMes = +request.query['inicial-mes'];
    const inicialAno = +request.query['inicial-ano'];
    const finalMes = +request.query['final-mes'];
    const finalAno = +request.query['final-ano'];

    // mes e ano inicial são colocados em um objeto --
    const inicial = {
        mes: inicialMes,
        ano: inicialAno
    };

    // mes e ano final são colocados em um objeto --
    const final = {
        mes: finalMes,
        ano: finalAno
    };

    // função no banco que faz o select da saúde da iluminação é chamada --
    db.relatorioSaudeIluminacao({inicial, final}, (erro, relatorio) => {
        if (erro) {
            response.status(500).send();
        } else {
            response.send(relatorio);
        }
    });
});

//porta de conexão do servidor --
server.listen('8080', () => {
    console.log("Servidor rodando!")
});