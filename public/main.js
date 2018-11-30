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
        if(response.status === 500) {
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

function postesNaoInspecionados({dataInicial, dataFinal}, complete) {
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

function notaIluminacao ({mes, ano}, complete) {
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

    // ID serial,
    // estado_conservacao boolean,
    // prumo boolean,
    // condicao_fiacao boolean,
    // data date,
    // poste_etiqueta char(5),
    // primary key (ID)

    const form = event.target;
    const estadoConservacao = JSON.parse(form.querySelector('[name="estado-conservacao"]:checked').value);
    const prumo = JSON.parse(form.querySelector('[name="prumo"]:checked').value);
    const condicaoFiacao = JSON.parse(form.querySelector('[name="condicao-fiacao"]:checked').value);
    const data = new Date(form.querySelector('[name="data"]').value);
    const posteEtiqueta = form.querySelector('[name="poste-etiqueta"]').value;

    const inspecao = {
        estadoConservacao,
        prumo,
        condicaoFiacao,
        data: `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`,
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
    postesNaoInspecionados({dataInicial, dataFinal}, (erro, postes) => {
        if (erro) {
            alert('não foi dessa vez');
        }else {
            alert('acertou, mizeravi');

            for(let i = 0; i < postes.length; i++) {
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
                latitude.innerHTML= poste.latitude;
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

document.getElementById('atualizar-postes-nao-inspecionados').addEventListener('click', atualizarTabelaPostesNaoInspecionados);

function atualizarNotaIluminacao () {
    const inputNota = document.getElementById('nota-saude');
    const mesAno = document.getElementById('mes-ano').value;
    const ano = mesAno.split('-')[0];
    const mes = mesAno.split('-')[1];

    notaIluminacao({mes, ano}, (erro, response) => {
        if (erro) {
            alert("Não foi dessa vez");
        } else {
            inputNota.value = `${response.nota}/${response.total}`;
        }
    });
    
};

document.getElementById('gerar-nota').addEventListener('click', atualizarNotaIluminacao);


