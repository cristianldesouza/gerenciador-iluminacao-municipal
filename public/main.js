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
            complete('não foi possível gerar o relatório')
        } else {
            return response.json()
                .then((body) => {
                    complete(undefined, body);
                });
        }
    })
    .catch(complete);
}

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


