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
            alert('num foi dessa vez');
        } else {
            alert('acerto mizeravi');
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
            alert('num foi dessa vez');
        } else {
            alert('acerto mizeravi');
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
            alert('Não foi dessa vez');
        } else {
            alert('acertou, mizeravi');

            // caso a requisição seja concluida com suceso, cria a tabela com o objeto poste obtido --
            for (let i = 0; i < postes.length; i++) {
                const poste = postes[i];
                const row = document.createElement('tr');
                const etiqueta = document.createElement('td');
                const material = document.createElement('td');
                const latitude = document.createElement('td');
                const longitude = document.createElement('td');

                switch (poste.material) {
                    case 'F': material.innerHTML = 'Ferro'; break;
                    case 'M': material.innerHTML = 'Madeira'; break;
                    case 'C': material.innerHTML = 'Concreto'; break;
                }
                etiqueta.innerHTML = poste.etiqueta;
                latitude.innerHTML = poste.latitude;
                longitude.innerHTML = poste.longitude;

                row.appendChild(etiqueta);
                row.appendChild(material);
                row.appendChild(latitude);
                row.appendChild(longitude);

                tbody.appendChild(row);
            }
        }
    });


}

// função que atualiza a tabela de postes não inspecionados quando uma requisição é feita
function atualizarTabelaPostesNaoInspecionados() {
    const tabela = document.getElementById('postes-nao-inspecionados');
    const tbody = tabela.getElementsByTagName('tbody')[0];
    const dataInicial = document.getElementById('data-inicial').value;
    const dataFinal = document.getElementById('data-final').value;

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    postesNaoInspecionados({ dataInicial, dataFinal }, (erro, postes) => {
        if (erro) {
            alert('não foi dessa vez');
        } else {
            alert('acertou, mizeravi');

            for (let i = 0; i < postes.length; i++) {
                const poste = postes[i];
                const row = document.createElement('tr');
                const etiqueta = document.createElement('td');
                const material = document.createElement('td');
                const latitude = document.createElement('td');
                const longitude = document.createElement('td');

                switch (poste.material) {
                    case 'F': material.innerHTML = 'Ferro'; break;
                    case 'M': material.innerHTML = 'Madeira'; break;
                    case 'C': material.innerHTML = 'Concreto'; break;
                }
                etiqueta.innerHTML = poste.etiqueta;
                latitude.innerHTML = poste.latitude;
                longitude.innerHTML = poste.longitude;

                row.appendChild(etiqueta);
                row.appendChild(material);
                row.appendChild(latitude);
                row.appendChild(longitude);

                tbody.appendChild(row);
            }
        }
    });

}


function atualizarNotaIluminacao() {
    const inputNota = document.getElementById('nota-saude');
    const mesAno = document.getElementById('mes-ano').value;
    const ano = mesAno.split('-')[0];
    const mes = mesAno.split('-')[1];

    notaIluminacao({ mes, ano }, (erro, response) => {
        if (erro) {
            alert("Não foi dessa vez");
        } else {
            inputNota.value = `${response.nota}/${response.total}`;
        }
    });

}

function atualizarGraficoSaudeIluminacao() {
    const inicialAnoMes = document.getElementById('mes-ano-inicial').value;
    const finalAnoMes = document.getElementById('mes-ano-final').value;
    const mesInicial = inicialAnoMes.split('-')[1];
    const anoInicial = inicialAnoMes.split('-')[0];
    const mesFinal = finalAnoMes.split('-')[1];
    const anoFinal = finalAnoMes.split('-')[0];

    const inicial = {
        mes: +mesInicial,
        ano: +anoInicial
    }

    const final = {
        mes: +mesFinal,
        ano: +anoFinal
    }

    relatorioSaudeIluminacao({ inicial, final }, (erro, resultado) => {
        console.log(resultado);
        if (erro) {
            alert('Não foi dessa vez');
        } else {
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
                        backgroundColor: 'rgb(99, 132, 255)',
                        borderColor: 'rgb(75, 100, 200)',
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

document.getElementById('gerar-nota').addEventListener('click', atualizarNotaIluminacao);
document.getElementById('gerar-lista-postes').addEventListener('click', atualizarTabelaPostes);
document.getElementById('atualizar-postes-nao-inspecionados').addEventListener('click', atualizarTabelaPostesNaoInspecionados);
document.getElementById('gerar-grafico').addEventListener('click', atualizarGraficoSaudeIluminacao);


