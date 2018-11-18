//inclui a biblioteca pg e atribui a variavel pg --
const pg = require('pg');

//configuração postgres -- 
const config = {
    user: 'postgres',
    database: 'magnani_inspections',
    password: '6019',
    port: '5432'
};

//conexão postgres --
const pool = new pg.Pool(config);

// função que insere poste, exportada para ser utilizada em outro arquivo --
exports.inserirPoste = function inserirPoste({etiqueta, material, latitude, longitude}, complete) {
    //interpolação de string -- 
    const sql = `INSERT INTO poste (etiqueta, material, latitude, longitude) VALUES ('${etiqueta}', '${material}', ${latitude}, ${longitude})`;
    console.log(sql)
    pool.connect((error, client, done) => {
        if(error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        }else {
            client.query(sql, (error) => {
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                }
                done();
                complete(error);
            });
        }        

    });

}

// função que insere inspeção, exportada para ser utilizada em outro arquivo --
exports.inserirInspecao = function inserirInspecao({estadoConservacao, prumo, condicaoFiacao, data, posteEtiqueta}, complete) {
    const sql = `INSERT INTO inspecao (estado_conservacao, prumo, condicao_fiacao, data, poste_etiqueta) VALUES (${estadoConservacao}, ${prumo}, ${condicaoFiacao}, '${data}', '${posteEtiqueta}') RETURNING ID`;

    pool.connect((error, client, done) => {
        if(error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        }else {
            client.query(sql, (error, result) => {
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                }
                const { id } = result.rows[0];
                done();
                complete(error, { ID: id });
            });
        }        

    });
}

//select relatório 1
exports.postesNaoInspecionados = function postesNaoInspecionados({dataInicial, dataFinal}, complete) {
    const sql = `SELECT poste.* FROM poste LEFT JOIN inspecao on poste.etiqueta = inspecao.poste_etiqueta AND inspecao.data >= '${dataInicial}' AND inspecao.data <= '${dataFinal}' WHERE inspecao.ID IS NULL`;
   
    pool.connect((error, client, done) => {
        if(error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        }else {
            client.query(sql, (error, result) => {
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                }
                const postes = result.rows;
                done();
                complete(error, postes);
            });
        }  
    });
}

//select relatório 2



