//inclui a biblioteca pg e atribui a variavel pg --
const pg = require('pg');

// configuração de autenticação no postgres é colocada em um objeto -- 
const config = {
    user: 'postgres',
    database: 'magnani_inspections',
    password: '6019',
    port: '5432'
};

// passa a configuração de autenticação para o banco --
const pool = new pg.Pool(config);

// função que insere poste, exportada para ser utilizada em outro arquivo --
exports.inserirPoste = function inserirPoste({ etiqueta, material, latitude, longitude }, complete) {
    // SQL que insere o poste no banco --
    const sql = `INSERT INTO poste (etiqueta, material, latitude, longitude) 
                 VALUES ('${etiqueta}', '${material}', ${latitude}, ${longitude})`;

    // conexão no banco enviando o SQL, aqui há 2 erros possíveis, o erro de conexão e o de consulta, caso haja algum
    // é retornado para a requisição feita --
    pool.connect((error, client, done) => {
        if (error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        } else {
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
exports.inserirInspecao = function inserirInspecao({ estadoConservacao, prumo, condicaoFiacao, data, posteEtiqueta }, complete) {
    // SQL que insere inspeção no banco --
    const sql = `INSERT INTO inspecao (estado_conservacao, prumo, condicao_fiacao, data, poste_etiqueta) 
                 VALUES (${estadoConservacao}, ${prumo}, ${condicaoFiacao}, '${data}', '${posteEtiqueta}')
                 RETURNING ID`;

    // conexão no banco enviando o SQL a ser executado --
    pool.connect((error, client, done) => {
        if (error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        } else {
            client.query(sql, (error, result) => {
                let id;
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                } else {
                    ({ id } = result.rows[0]);
                }
                done();
                complete(error, { ID: id });
            });
        }

    });
}

// função que verifica se o poste tem inspeção, exportada para ser usada no servidor --
exports.posteTemInspecaoNoMes = function posteTemInspecaoNoMes({ etiqueta, ano, mes }, complete) {
    // SQL que insere inspeção no banco --
    const sql = `SELECT * 
                FROM inspecao 
                WHERE poste_etiqueta = '${etiqueta}' AND
                EXTRACT(MONTH FROM data) = '${mes}' AND 
                EXTRACT(YEAR FROM data) = '${ano}'`;

            
    // funções que executam o SQL no banco --
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

//função que gera a lista de postes --
exports.listaPostes = function listaPostes(complete) {
    // SQL que gera tabela de postes --
    const sql = `SELECT * FROM poste ORDER BY etiqueta`;

    // conexão com o banco --
    pool.connect((error, client, done) => {
        if (error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        } else {
            client.query(sql, (error, result) => {
                let postes;
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                } else {
                    postes = result.rows;
                }
                done();
                complete(error, postes);

            });
        }
    });
}

// função que gera o relatório de postes não inspecionados, exportada para ser usada no servidor --
exports.postesNaoInspecionados = function postesNaoInspecionados({ dataInicial, dataFinal }, complete) {
    // SQL que faz o select do relatório --
    const sql = `SELECT poste.* 
                FROM poste 
                LEFT JOIN inspecao on poste.etiqueta = inspecao.poste_etiqueta 
                AND inspecao.data >= '${dataInicial}' 
                AND inspecao.data <= '${dataFinal}' 
                WHERE inspecao.ID IS NULL`;
                
    // conexão com o banco enviando o sql --
    pool.connect((error, client, done) => {
        if (error) {
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        } else {
            client.query(sql, (error, result) => {
                let postes;
                if (error) {
                    console.error("Não foi possível consultar o banco " + error);
                } else {
                    postes = result.rows;
                }
                done();
                complete(error, postes);

            });
        }
    });
}

// função que gera a nota da saúde da iluminação exportada para ser usada no servidor --
exports.saudeMensalIluminacao = function saudeMensalIluminacao({ mes, ano }, complete) {
    // SQL que faz o select para gerar a nota da saude mensal da iluminação --
    const sql = `SELECT coalesce(sum(pontuacao), 0) as nota, coalesce(sum(total), 0) as total
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
                     AND (EXTRACT (MONTH FROM inspecao.data) = ${mes}
                     AND EXTRACT  (YEAR FROM inspecao.data) = ${ano})
                     WHERE inspecao.id is null
                     )
                 ) as T`;

    // conexão com o banco --
    pool.connect((error, client, done) => {
        if (error) {
            // como é uma consulta, tem dois erros possíveis, o erro de conexão ao banco, e o erro de consulta no banco --
            console.error("Não foi possível conectar ao banco " + error);
            complete(error);
        } else {
            client.query(sql, (erro, result) => {
                let nota;
                let total;
                if (erro) {
                    console.error("Não foi possível consultar o banco " + erro);
                } else {
                    ({ nota, total } = result.rows[0]);
                }
                done();
                complete(erro, { nota, total });
            });
        }
    });

};

//função que gera informações do gráfico (bruxaria) --
exports.relatorioSaudeIluminacao = function relatorioSaudeIluminacao({inicial, final}, complete, resultado = []) {
    // esse desvio verifica se a data inicial é menor que a final, caso não seja, retorna com erro de data --
    if ((inicial.mes > final.mes && inicial.ano === final.ano) || inicial.ano > final.ano) {
        complete('Data inicial deve ser menor que a data final');
    }
    // a função que gera a nota de iluminação no mês inicial é chamada, com um call back passado por parâmetro --
    exports.saudeMensalIluminacao(inicial, (erro, nota) => {
        if(erro) {
            complete(erro);
        }else {
            // caso o mês inicial seja igual ao final, retorna os valores como um array --
            if (inicial.mes === final.mes && inicial.ano === final.ano) {
                complete(erro, resultado.concat([nota]));
            } else {
                // cada vez que é gerado uma nota para um mês, o novo mês inicial é incrementado, para gerar a nota do próximo --
                const novoInicial = {
                    mes: inicial.mes + 1 === 13 ? 1 : inicial.mes + 1,
                    ano: inicial.mes + 1 === 13 ? inicial.ano + 1 : inicial.ano
                };
                // o callback chama a função novamente, para gerar a nota de todos os meses entre o inicial e o final --
                exports.relatorioSaudeIluminacao({ inicial: novoInicial, final }, complete, resultado.concat([nota]));
            }
        }
    });

}


