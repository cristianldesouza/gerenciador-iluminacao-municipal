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
    const sql = `INSERT INTO poste (etiqueta, material, latitude, longitude) 
                 VALUES ('${etiqueta}', '${material}', ${latitude}, ${longitude})`;
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
    const sql = `INSERT INTO inspecao (estado_conservacao, prumo, condicao_fiacao, data, poste_etiqueta) 
                 VALUES (${estadoConservacao}, ${prumo}, ${condicaoFiacao}, '${data}', '${posteEtiqueta}')
                 RETURNING ID`;

    pool.connect((error, client, done) => {
        if(error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        }else {
            client.query(sql, (error, result) => {
                let id;
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                }else {
                    ({ id } = result.rows[0]);
                }
                done();
                complete(error, { ID: id });
            });
        }        

    });
}

//verificar inspecao
exports.posteTemInspecaoNoMes = function posteTemInspecaoNoMes ({etiqueta, ano, mes}, complete) {
    const sql = `SELECT * 
                FROM inspecao 
                WHERE poste_etiqueta = '${etiqueta}' AND
                EXTRACT(MONTH FROM data) = '${mes}' AND 
                EXTRACT(YEAR FROM data) = '${ano}'`;

    pool.connect((error, client, done) => {
        if (error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error)
        } else {
            client.query(sql, (error, result) => {
                let resultado;
                if (error) {
                    console.error("Não foi possível consultar o b anco " + error);
                } else {
                    resultado = result.rows.length > 0;
                }
                done();
                complete(error, resultado);
            });
        }
    });
}

//select relatório 1
exports.postesNaoInspecionados = function postesNaoInspecionados({dataInicial, dataFinal}, complete) {
    const sql = `SELECT poste.* 
                FROM poste 
                LEFT JOIN inspecao on poste.etiqueta = inspecao.poste_etiqueta 
                AND inspecao.data >= '${dataInicial}' 
                AND inspecao.data <= '${dataFinal}' 
                WHERE inspecao.ID IS NULL`;
   
    pool.connect((error, client, done) => {
        if(error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        }else {
            client.query(sql, (error, result) => {
                let postes;
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                }else {
                    postes = result.rows;
                }
                done();
                complete(error, postes);

            });
        }  
    });
}

//select relatório 2
exports.saudeMensalIluminacao = function saudeMensalIluminacao({mes, ano}, complete) {
    const sql = `SELECT sum(pontuacao) as nota, sum(total) as total 
                 FROM (
                     (
                     SELECT sum(case when estado_conservacao then 1 else 0 end) +
                     sum (case when prumo then 1 else 0 end) +
                     sum (case when condicao_fiacao then 1 else 0 end) as pontuacao,
                     sum (3) as total
                     FROM inspecao
                     WHERE EXTRACT (MONTH FROM data) = ${mes}
                     AND EXTRACT  (YEAR FROM data) = ${ano}
                     GROUP BY poste_etiqueta
                     )
                     UNION ALL
                     (
                     SELECT 3 as pontuacao, 3 as total
                     FROM poste
                     LEFT JOIN inspecao ON inspecao.poste_etiqueta = poste.etiqueta
                     AND NOT(EXTRACT (MONTH FROM inspecao.data) = ${mes}
                     AND EXTRACT  (YEAR FROM inspecao.data) = ${ano})
                     GROUP BY inspecao.poste_etiqueta
                     )
                 ) as T`;

    pool.connect((error, client, done) => {
        if (error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        } else {
            client.query(sql, (erro, result) => {
                let nota;
                let total;
                if (erro) {
                    console.error("Não foi possível consultar o banco "+ erro);
                } else {
                    ({nota, total} = result.rows[0]);
                }
                done();
                complete(erro, {nota, total});
            });
        }
    });

};
exports.saudeMensalIluminacao({mes: 10, ano: 2018}, (erro) => {
    console.log(erro);
});




