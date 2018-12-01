const serverURL = 'http://localhost:8080';

//funções de comunicação cliente-servidor --
function inserirPoste(poste, complete) {
    fetch(`${serverURL}/inserir-poste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poste)
    })
        .then((response) => {
            if (response.status === 500) {
                complete('não foi possível inserir o poste');
            } else {
                complete();
            }
        })
        .catch(complete);
}

function inserirInspecao(inspecao, complete) {
    fetch(`${serverURL}/inserir-inspecao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspecao)
    })
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

function postesNaoInspecionados({ dataInicial, dataFinal }, complete) {
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

document.getElementById('cadastro-poste').addEventListener('submit', (event) => {
    event.preventDefault();

    const form = event.target;
    const etiqueta = form.querySelector('[name="etiqueta"]').value;
    const material = form.querySelector('[name="material"]:checked').value;
    const latitude = form.querySelector('[name="latitude"]').value;
    const longitude = form.querySelector('[name="longitude"]').value;

    const poste = {
        etiqueta,
        material,
        latitude,
        longitude
    };

    inserirPoste(poste, (error) => {
        if (error) {
            alert('num foi dessa vez');
        } else {
            alert('acerto mizeravi');
        }
    });
});

document.getElementById('cadastro-inspecao').addEventListener('submit', (event) => {
    event.preventDefault();

    const form = event.target;
    const estadoConservacao = JSON.parse(form.querySelector('[name="estado-conservacao"]:checked').value);
    const prumo = JSON.parse(form.querySelector('[name="prumo"]:checked').value);
    const condicaoFiacao = JSON.parse(form.querySelector('[name="condicao-fiacao"]:checked').value);
    const data = form.querySelector('[name="data"]').value;
    const posteEtiqueta = form.querySelector('[name="poste-etiqueta"]').value;

    const inspecao = {
        estadoConservacao,
        prumo,
        condicaoFiacao,
        data,
        posteEtiqueta
    };

    inserirInspecao(inspecao, (error) => {
        if (error) {
            alert('num foi dessa vez');
        } else {
            alert('acerto mizeravi');
        }
    });
});

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

};

function atualizarTabelaPostes() {
    const tabela = document.getElementById('lista-postes');
    const tbody = tabela.getElementsByTagName('tbody')[0];

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild)
    }

    listaPostes((erro, postes) => {
        if (erro) {
            alert('Não foi dessa vez');
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

};

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


