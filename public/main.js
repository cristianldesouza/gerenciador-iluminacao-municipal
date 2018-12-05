const serverURL = 'http://localhost:8080';

//funções de comunicação cliente-servidor --


// função que envia o poste para ser inserido pelo servidor no banco --
function inserirPoste(poste, complete) {
    //a função fetch() envia por POST uma requisição para o servidor, com o body da requisição em formato string JSON --
    fetch(`${serverURL}/inserir-poste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poste)
    })
        //a resposta da requisição é tratada no then(), caso o status da resposta seja 500, a função complete() retorna pro cliente 
        //o erro do servidor, caso nao haja erro, copleta a ação --
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível inserir o poste');
            } else {
                complete();
            }
        })
        // a função catch() pega o erro e retorna para o callback --
        .catch(complete);
}


// função que envia a inspeção para ser inserida pelo backend no banco --
function inserirInspecao(inspecao, complete) {
    //a inspeção é enviada em forma de string JSON para o backend --
    fetch(`${serverURL}/inserir-inspecao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspecao)
    })
        //caso haja erro na resposta, ela é tratada --
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível inserir a inspeção');
            } else {
                return response.json()
                    .then((body) => {
                        complete(undefined, body);
                    });
            }
        })
        .catch(complete);
}

// função que faz uma requisição para o servidor para gerar uma lista de postes, por get --
function listaPostes(complete) {
    fetch(`${serverURL}/postes`)
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível gerar a lista');
            } else {
                return response.json()
                    .then((body) => {
                        complete(undefined, body);
                    });
            }
        })
        .catch(complete);
}


// função que envia uma requisição para obter os postes não inspecionados entre duas datas --
function postesNaoInspecionados({ dataInicial, dataFinal }, complete) {
    //as datas são enviadas para o servidor por get, o fetch envia as datas, retorna uma promise que trata se a requisição
    // foi feita com sucesso ou se houve erro 500 --
    fetch(`${serverURL}/postes-nao-inspecionados?data-inicial=${dataInicial}&data-final=${dataFinal}`)
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível gerar o relatório');
            } else {
                return response.json()
                    .then((body) => {
                        complete(undefined, body);
                    });
            }
        })
        .catch(complete);
}



// função que envia uma requisição para para o servidor a fim de obter a saúde da iluminação em um determinado mês enviado por get
function notaIluminacao({ mes, ano }, complete) {
    fetch(`${serverURL}/saude-iluminacao?mes=${mes}&ano=${ano}`)
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível gerar a nota');
            } else {
                return response.json()
                    .then((body) => {
                        complete(undefined, body);
                    });
            }
        })
        .catch(complete);
};

// função que envia uma requisição com duas datas (mês e ano), por get, para objter a saúde da iliminação no período
function relatorioSaudeIluminacao({ inicial, final }, complete) {
    fetch(`${serverURL}/relatorio-saude-iluminacao?inicial-mes=${inicial.mes}&inicial-ano=${inicial.ano}&final-mes=${final.mes}&final-ano=${final.ano}`)
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível gerar o relatório');
            } else {
                return response.json()
                    .then((body) => {
                        complete(undefined, body);
                    });
            }
        })
        .catch(complete);
}


// evento adicionado no formulário de cadastro no poste --
document.getElementById('cadastro-poste').addEventListener('submit', (event) => {
    event.preventDefault();

    // informações do poste obtida dos campos do formulário --
    const form = event.target;
    const etiqueta = form.querySelector('[name="etiqueta"]').value;
    const material = form.querySelector('[name="material"]:checked').value;
    const latitude = form.querySelector('[name="latitude"]').value;
    const longitude = form.querySelector('[name="longitude"]').value;

    //alerta de aviso
    const alertaSucesso = document.getElementById('sucesso-inserir-poste');
    const alertaErro = document.getElementById('erro-inserir-poste');

    // informações do post guardadas em um objeto
    const poste = {
        etiqueta,
        material,
        latitude,
        longitude
    };

    //a função inserirPoste() que faz a requisição para inserir o poste é chamada --
    inserirPoste(poste, (error) => {
        // a função inserir poste retorna a resposta do servidor, caso haja erro, ele é tratado, caso a requisição seja feita com sucesso, retorna um aviso --
        if (error) {
            removeAlertas();
            alertaErro.style.display = 'block';
        } else {
            removeAlertas();
            alertaSucesso.style.display = 'block';
        }
    });
});

// evento adicionado no fomulário de cadastro de inspeção --
document.getElementById('cadastro-inspecao').addEventListener('submit', (event) => {
    event.preventDefault();

    // informações da inspeção são obtidas dos campos do formulário (a função JSON.parse transforma o campo string em um objeto json) --
    const form = event.target;
    const estadoConservacao = JSON.parse(form.querySelector('[name="estado-conservacao"]:checked').value);
    const prumo = JSON.parse(form.querySelector('[name="prumo"]:checked').value);
    const condicaoFiacao = JSON.parse(form.querySelector('[name="condicao-fiacao"]:checked').value);
    const data = form.querySelector('[name="data"]').value;
    const posteEtiqueta = form.querySelector('[name="poste-etiqueta"]').value;

    //alerta de aviso
    const alertaSucesso = document.getElementById('sucesso-inserir-inspecao');
    const alertaErro = document.getElementById('erro-inserir-inspecao');

    // itens da inspeção são colocados em um objeto --
    const inspecao = {
        estadoConservacao,
        prumo,
        condicaoFiacao,
        data,
        posteEtiqueta
    };

    // a função inserirInspecao() é chamada para fazer a requisição ao servidor --
    inserirInspecao(inspecao, (error) => {
        if (error) {
            removeAlertas();
            alertaErro.style.display = 'block';
        } else {
            removeAlertas();
            alertaSucesso.style.display = 'block';
        }
    });
});

// função que atualiza tabela de postes quando a requisição para obter lista de postes é feita --
function atualizarTabelaPostes() {
    // a tabela e o body dela são inseridos em uma variável --
    const tabela = document.getElementById('lista-postes');
    const tbody = tabela.getElementsByTagName('tbody')[0];

    // limpa a tabela para ter certeza que os dados de uma requisição anterior não fiquem na tabela --
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild)
    }

    //chama a função que faz a requisição para o servidor --
    listaPostes((erro, postes) => {
        if (erro) {
            console.log('Não foi possível gerar a lista de postes');
        } else {
            // caso a requisição seja concluida com suceso, cria a tabela com o objeto poste obtido --
            for (let i = 0; i < postes.length; i++) {
                const poste = postes[i];
                const row = document.createElement('tr');
                const etiqueta = document.createElement('td');
                const material = document.createElement('td');
                const latitude = document.createElement('td');
                const longitude = document.createElement('td');

                // na resposta do banco, o material do poste vem como "F, M ou C", este valo é alterado para ferro madeira ou concreto --
                switch (poste.material) {
                    case 'F': material.innerHTML = 'Ferro'; break;
                    case 'M': material.innerHTML = 'Madeira'; break;
                    case 'C': material.innerHTML = 'Concreto'; break;
                }
                // coloca o valor do objeto json da resposta do servidor dentro de uma td --
                etiqueta.innerHTML = poste.etiqueta;
                latitude.innerHTML = poste.latitude;
                longitude.innerHTML = poste.longitude;

                // adiciona as td's criadas na linha atual --
                row.appendChild(etiqueta);
                row.appendChild(material);
                row.appendChild(latitude);
                row.appendChild(longitude);

                // adiciona a linha ao corpo da tabela --
                tbody.appendChild(row);
            }
        }
    });


}

// função que atualiza a tabela de postes não inspecionados quando uma requisição é feita --
function atualizarTabelaPostesNaoInspecionados() {
    // elementos da tabela são inseridos em variáveis --
    const tabela = document.getElementById('postes-nao-inspecionados');
    const tbody = tabela.getElementsByTagName('tbody')[0];
    // valores das datas, inicial e final são colocados em variáveis para a chamada da função que faz requisição pro servidor --
    const dataInicial = document.getElementById('data-inicial').value;
    const dataFinal = document.getElementById('data-final').value;

    // limpa a tabela para que a ultima chamada seja a única apresentada --
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    // chamada da função que faz a requisição pro servidor, para obter os postes não inspecionados --
    postesNaoInspecionados({ dataInicial, dataFinal }, (erro, postes) => {
        if (erro) {
            console.log('Não foi possível buscar os postes não inspecionados');
        } else {
            alert('acertou, mizeravi');
            // caso haja resposta do servidor, cria a tabela com a resposta --
            for (let i = 0; i < postes.length; i++) {
                const poste = postes[i];
                const row = document.createElement('tr');
                const etiqueta = document.createElement('td');
                const material = document.createElement('td');
                const latitude = document.createElement('td');
                const longitude = document.createElement('td');

                // na resposta do banco, o material do poste vem como "F, M ou C", este valo é alterado para ferro madeira ou concreto --
                switch (poste.material) {
                    case 'F': material.innerHTML = 'Ferro'; break;
                    case 'M': material.innerHTML = 'Madeira'; break;
                    case 'C': material.innerHTML = 'Concreto'; break;
                }

                // valor do objeto obtido como resposta é atribuido aos td's --
                etiqueta.innerHTML = poste.etiqueta;
                latitude.innerHTML = poste.latitude;
                longitude.innerHTML = poste.longitude;

                // td's são inseridos a tr --
                row.appendChild(etiqueta);
                row.appendChild(material);
                row.appendChild(latitude);
                row.appendChild(longitude);

                // tr é adicionada a tbody --
                tbody.appendChild(row);
            }
        }
    });

}


// função que chama a requisição e mostra no cliente o relatório 2 --
function atualizarNotaIluminacao() {
    //os campos onde a nota será colocada e dos dados do relatório são colocados en variáveis --
    const inputNota = document.getElementById('nota-saude');
    const mesAno = document.getElementById('mes-ano').value;
    const ano = mesAno.split('-')[0];
    const mes = mesAno.split('-')[1];

    // a função que faz a requisição ao servidor é chamada --
    notaIluminacao({ mes, ano }, (erro, response) => {
        if (erro) {
            console.log('Não foi possível gerar a nota da iluminação');
        } else {
            // caso a requisição seja feita com sucesso, atribui a resposta do servidor ao input de resposta --
            inputNota.value = `${response.nota}/${response.total}`;
        }
    });

}

// função que faz a chamada e mostra o gráfico no cliente --
function atualizarGraficoSaudeIluminacao() {
    // elementos necessários para gerar o gráfico são atribuidos em variáveis --
    const inicialAnoMes = document.getElementById('mes-ano-inicial').value;
    const finalAnoMes = document.getElementById('mes-ano-final').value;
    const mesInicial = inicialAnoMes.split('-')[1];
    const anoInicial = inicialAnoMes.split('-')[0];
    const mesFinal = finalAnoMes.split('-')[1];
    const anoFinal = finalAnoMes.split('-')[0];

    // mes e ano inicial são colocados em um objeto para serem enviados na requisição --
    const inicial = {
        // o + é colocado antes da variável para transformar uma string em um numero
        mes: +mesInicial,
        ano: +anoInicial
    }

    // mes e ano final são colocados em um objeto para serem enviados na requisição --
    const final = {
        // o + é colocado antes da variável para transformar uma string em um número --
        mes: +mesFinal,
        ano: +anoFinal
    }

    // função que faz a requisição é chamada --
    relatorioSaudeIluminacao({ inicial, final }, (erro, resultado) => {
        if (erro) {
            console.log('Não foi possível gerar o gráfico');
        } // caso a requisição seja feita com sucesso, o gráfico é criado com a biblioteca Chart.js --
        else {
            // na resposta do servidor, os meses são números, foi criado um array para atribuir o nome do mês a seu número correspondente --
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const labels = [];
            let mesAtual = inicial.mes;
            let anoAtual = inicial.ano;
            while (mesAtual <= final.mes && anoAtual === final.ano || anoAtual < final.ano) {
                labels.push(meses[mesAtual - 1] + ' - ' + anoAtual);
                anoAtual = mesAtual + 1 === 13 ? anoAtual + 1 : anoAtual;
                mesAtual = mesAtual + 1 === 13 ? 1 : mesAtual + 1;
            }
            var ctx = document.getElementById('myChart').getContext('2d');
            var chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: "Grafico saúde iluminação",
                        backgroundColor: 'rgb(91, 192, 222)',
                        borderColor: 'rgb(66, 139, 202)',
                        data: resultado.map(r => +r.nota),
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            display: true,
                            ticks: {
                                beginAtZero: true,
                                steps: 1,
                                max: +resultado[0].total
                            }
                        }]
                    }
                }
            });
        }
    });
}

// os eventos que chamam as funções que fazem as requisições ao servidor são atribuidos aos botões --
document.getElementById('gerar-nota').addEventListener('click', atualizarNotaIluminacao);
document.getElementById('atualizar-postes-nao-inspecionados').addEventListener('click', atualizarTabelaPostesNaoInspecionados);
document.getElementById('gerar-grafico').addEventListener('click', atualizarGraficoSaudeIluminacao);


//caminhos para as telas --
const telaCadastroPoste = document.getElementById('tela-cadastro-poste');
const telaCadastroInspecao = document.getElementById('tela-cadastro-inspecao');
const telaListaPostes = document.getElementById('tela-lista-postes');
const telaPostesNaoInspecionados = document.getElementById('tela-postes-nao-inspecionados');
const telaSaudeDaIluminacaoPublica = document.getElementById('tela-saude-da-iluminacao-publica');
const telaGrafico = document.getElementById('tela-grafico');
const todasTelas = document.getElementsByClassName('tela');

//caminhos para os botões --
const botaoCadastroPoste = document.getElementById('botao-cadastro-postes');
const botaoCadastroInspecao = document.getElementById('botao-cadastro-inspecao');
const botaoListaPostes = document.getElementById('botao-lista-postes');
const botaoPostesNaoInspecionados = document.getElementById('botao-postes-nao-inspecionados');
const botaoSaudeDaIluminacaoPublica = document.getElementById('botao-saude-iluminacao-publica');
const botaoGrafico = document.getElementById('botao-grafico');
const todosOsBotoes = document.getElementsByTagName('a');
const alertas = document.getElementsByClassName('alerta');

//remove o active dos botões --
function removeActiveBotoes() {
    for (let i = 0; i < todosOsBotoes.length; i++) {
        todosOsBotoes[i].classList.remove("active");
    };
}

//remove os alertas --
function removeAlertas() {
    for (let i = 0; i < alertas.length; i++) {
        alertas[i].style.display = 'none';
    };
}


//remove todas as telas --
function desativaTodasTelas() {
    for (let i = 0; i < todasTelas.length; i++) {
        todasTelas[i].style.display = 'none';
    };
}

//eventos que trocam as telas telas --
document.getElementById('botao-cadastro-postes').addEventListener('click', (event) => {
    event.preventDefault();
    removeActiveBotoes();
    desativaTodasTelas();
    removeAlertas();
    telaCadastroPoste.style.display = 'block';
    botaoCadastroPoste.classList.add("active");
});
document.getElementById('botao-cadastro-inspecao').addEventListener('click', (event) => {
    event.preventDefault();
    removeActiveBotoes();
    desativaTodasTelas();
    removeAlertas();
    telaCadastroInspecao.style.display = 'block';
    botaoCadastroInspecao.classList.add("active");
});
document.getElementById('botao-lista-postes').addEventListener('click', (event) => {
    event.preventDefault();
    atualizarTabelaPostes();
    removeActiveBotoes();
    desativaTodasTelas();
    telaListaPostes.style.display = 'block';
    botaoListaPostes.classList.add("active");
});
document.getElementById('botao-postes-nao-inspecionados').addEventListener('click', (event) => {
    event.preventDefault();
    removeActiveBotoes();
    desativaTodasTelas();
    telaPostesNaoInspecionados.style.display = 'block';
    botaoPostesNaoInspecionados.classList.add("active");
});
document.getElementById('botao-saude-iluminacao-publica').addEventListener('click', (event) => {
    event.preventDefault();
    removeActiveBotoes();
    desativaTodasTelas();
    telaSaudeDaIluminacaoPublica.style.display = 'block';
    botaoSaudeDaIluminacaoPublica.classList.add("active");
});
document.getElementById('botao-grafico').addEventListener('click', (event) => {
    event.preventDefault();
    removeActiveBotoes();
    desativaTodasTelas();
    telaGrafico.style.display = 'block';
    botaoGrafico.classList.add("active");
});
document.getElementById('home').addEventListener('click', (event) => {
    event.preventDefault();
    removeActiveBotoes();
    telaCadastroPoste.style.display = 'block';
    botaoCadastroPoste.classList.add("active");
});




