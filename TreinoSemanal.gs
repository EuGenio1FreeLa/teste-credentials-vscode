/**
 * Importar Central Para Weekly
 * 
 * Esta função percorre cada bloco diário na aba Central de Treinos,
 * lê sessão e séries de exercícios, monta objetos no formato FIELDS
 * e depois grava todos registros na aba treino_semanal, limpando o bloco anterior.
 * 
 * @param {string} idPlanilhaAluno - ID da planilha do aluno
 * @return {object} Objeto com status da operação e mensagem
 */
function importarCentralParaWeekly(idPlanilhaAluno) {
  try {
    Logger.log("Iniciando importação de Central para Weekly");
    
    // 1. Abrir a planilha-mãe e a planilha-aluno
    const ssMaster = SpreadsheetApp.openById(IDS.MASTER);
    const sheetCentral = ssMaster.getSheetByName(SHEETS.CENTRAL);
    
    // Verificar se foi fornecido um ID de planilha de aluno
    if (!idPlanilhaAluno) {
      // Tentar obter a planilha do aluno selecionado na célula B1
      const alunoSelecionado = sheetCentral.getRange("B1").getValue();
      if (!alunoSelecionado) {
        throw new Error("Nenhum aluno selecionado e nenhum ID de planilha fornecido");
      }
      
      // Encontrar o ID da planilha do aluno selecionado
      const sheetAlunosCadastro = ssMaster.getSheetByName(SHEETS.ALUNOS_CADASTRO);
      const alunosData = sheetAlunosCadastro.getRange(CONSTANTES.MAE_LISTA_ALUNOS_CADASTRO).getValues();
      
      for (let i = 0; i < alunosData.length; i++) {
        if (alunosData[i][CONSTANTES.COL_NOME_ALUNO_CADASTRO] === alunoSelecionado) {
          idPlanilhaAluno = alunosData[i][CONSTANTES.COL_ID_PLANILHA_ALUNO_CADASTRO];
          break;
        }
      }
      
      if (!idPlanilhaAluno) {
        throw new Error(`Não foi possível encontrar a planilha para o aluno: ${alunoSelecionado}`);
      }
    }
    
    // Abrir a planilha do aluno
    const ssAluno = SpreadsheetApp.openById(idPlanilhaAluno);
    const sheetWeekly = ssAluno.getSheetByName(SHEETS.WEEKLY);
    
    if (!sheetWeekly) {
      throw new Error(`Aba ${SHEETS.WEEKLY} não encontrada na planilha do aluno`);
    }
    
    // Obter informações do aluno
    const nomeAluno = sheetCentral.getRange("B1").getValue();
    const studentId = sheetCentral.getRange("A1").getValue();  // 1. Ler o ID do aluno da célula A1
    const mondayDate = sheetCentral.getRange("B2").getValue(); // Usar B2 como data de segunda-feira
    
    // 2. Obter referência de ID de exercícios (para lookup nome -> ID)
    const sheetExercicios = ssMaster.getSheetByName("Exercicios");
    const exerciciosData = sheetExercicios.getRange("C2:D").getValues();
    
    // Criar mapa de nome -> ID de exercício
    const exerciciosMap = {};
    for (let i = 0; i < exerciciosData.length; i++) {
      if (exerciciosData[i][0]) {  // Se tem nome de exercício
        exerciciosMap[exerciciosData[i][0]] = exerciciosData[i][1];  // Nome -> ID
      }
    }
    
    // 3. Percorrer os dias da semana e coletar registros usando a nova abordagem de linhas dinâmicas
    let registros = [];
    const days = CONFIG.DAYS;
    
    // Gerar um ID único para a sessão de treino (mesmo para todos os exercícios)
    const idTreinoSessao = Utilities.getUuid();
    
    // Loop pelos dias da semana usando a nova abordagem de montarRowData
    days.forEach((dia, dayIndex) => {
      Logger.log(`Processando dia: ${dia} (índice ${dayIndex})`);
      
      // Calcular a data específica para este dia da semana
      const eventDate = new Date(mondayDate.getTime() + dayIndex * 24*60*60*1000);
      
      // Usar a nova função montarRowData para obter os dados de forma dinâmica e correta
      const rowsData = montarRowData(sheetCentral, idTreinoSessao, studentId, nomeAluno, eventDate, dia);
      
      // Log para debug
      Logger.log(`Dia ${dia}: processados ${rowsData.length} registros`);
      
      // Adicionar os registros processados para o dia atual ao array principal
      if (rowsData && rowsData.length > 0) {
        // Processar cada linha para adicionar o ID do exercício com base no mapa de exercícios
        rowsData.forEach((rowData) => {
          // O nome do exercício está na posição 11 do array rowData após a reestruturação
          const nomeExercicio = rowData[11];
          if (nomeExercicio && exerciciosMap[nomeExercicio]) {
            // Inserir o ID do exercício na posição adequada (posição 10 corresponde a ID_Exercicio)
            rowData[10] = exerciciosMap[nomeExercicio];
          }
          
          // Criar objeto com as propriedades nomeadas para facilitar a manipulação posterior
          const registro = {};
          FIELDS.forEach((field, i) => {
            registro[field] = rowData[i];
          });
          
          registros.push(registro);
          
          // Log para debug
          Logger.log(`Registro para ${dia}, exercício ${nomeExercicio} adicionado`);
          Logger.log(`Objetivo do dia para ${dia}: "${registro.objetivo_sessao}"`);
        });
      } else {
        Logger.log(`Nenhum registro encontrado para o dia ${dia}`);
      }
    });
    
    // 4. Converter objetos em matriz e gravar
    // Extrair headers em ordem
    const headers = FIELDS;
    
    // Criar matriz [ [val1, val2, …], … ]
    const valores = registros.map(reg =>
      headers.map(col => reg[col] !== undefined ? reg[col] : '')
    );
    
    // Debug: Verificar se objetivo_sessao está sendo incluído nos valores
    Logger.log(`Verificando valores para debug:`);
    Logger.log(`Headers: ${headers.join(', ')}`);
    Logger.log(`Posição de 'objetivo_sessao' nos headers: ${headers.indexOf('objetivo_sessao')}`);
    if (valores.length > 0) {
      Logger.log(`Exemplo de valores para primeiro registro: ${valores[0].join(', ')}`);
      Logger.log(`Valor de objetivo_sessao no primeiro registro: ${valores[0][headers.indexOf('objetivo_sessao')]}`);
    }
    
    Logger.log(`Total de registros a gravar: ${valores.length}`);
    
    // Limpar o bloco antigo e escrever novo
    if (valores.length > 0) {
      // ---- Gravar na planilha do aluno ----
      // Limpar dados antigos
      sheetWeekly
        .getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, 
                 CONSTANTES.NUM_LINHAS_TREINO_ALUNO, headers.length)
        .clearContent();
      
      // Debug: Logar informações antes de gravar
      Logger.log(`Preparando para gravar ${valores.length} registros na aba treino_semanal`);
      Logger.log(`Iniciando na linha ${CONSTANTES.LINHA_INICIO_TREINO_ALUNO}, gravando ${headers.length} colunas`);
      
      // Escrever novos dados
      sheetWeekly
        .getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, 
                 valores.length, headers.length)
        .setValues(valores);
        
      Logger.log(`Valores gravados na aba treino_semanal`);
      
      // Verificar se os dados foram gravados corretamente
      try {
        // Verificar se o objetivo da sessão foi gravado corretamente
        const objetivoSessao = sheetWeekly.getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 8, 1, 1).getValue();
        Logger.log(`Valor gravado na coluna H (objetivo_sessao) da primeira linha: "${objetivoSessao}"`);
        
        // Verificar se o nome do exercício foi gravado corretamente
        const nomeExercicio = sheetWeekly.getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 12, 1, 1).getValue();
        Logger.log(`Valor gravado na coluna L (Nome_Exercicio) da primeira linha: "${nomeExercicio}"`);
        
        // Verificar se a ordem do exercício foi gravada corretamente
        const ordemExercicio = sheetWeekly.getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 9, 1, 1).getValue();
        Logger.log(`Valor gravado na coluna I (Ordem_Exercicio) da primeira linha: "${ordemExercicio}"`);
      } catch(e) {
        Logger.log(`Erro ao verificar valor gravado: ${e.message}`);
      }
      
      // ---- Gravar na planilha Brainer (log) ----
      try {
        const ssBrainer = SpreadsheetApp.openById(IDS.BRAINER);
        const sheetLogBrainer = ssBrainer.getSheetByName(SHEETS.LOG);
        
        if (sheetLogBrainer) {
          // Obter a última linha com conteúdo na planilha Brainer
          const lastRow = sheetLogBrainer.getLastRow();
          
          // Gravar registros na próxima linha vazia
          if (lastRow > 0) {
            sheetLogBrainer.getRange(lastRow + 1, 1, valores.length, valores[0].length)
              .setValues(valores);
            Logger.log(`Registros gravados com sucesso na planilha Brainer`);
          } else {
            // Se a planilha estiver vazia, começar na linha 1
            sheetLogBrainer.getRange(1, 1, valores.length, valores[0].length)
              .setValues(valores);
            Logger.log(`Registros gravados com sucesso na planilha Brainer (planilha vazia)`);
          }
        } else {
          Logger.log(`AVISO: Aba ${SHEETS.LOG} não encontrada na planilha Brainer`);
        }
      } catch (brainerError) {
        // Registrar o erro, mas não falhar a função principal
        Logger.log(`Erro ao gravar na planilha Brainer: ${brainerError.message}`);
        Logger.log(`Stack: ${brainerError.stack}`);
      }
      
      Logger.log("Importação concluída com sucesso!");
      return { success: true, message: `${valores.length} registros importados com sucesso.` };
    } else {
      Logger.log("Nenhum registro para importar");
      return { success: false, message: "Nenhum registro para importar." };
    }
    
  } catch (error) {
    Logger.log(`Erro na importação: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return { success: false, message: `Erro na importação: ${error.message}` };
  }
}

/**
 * Envia dados de treino semanal para a planilha Brainer
 * Usa a abordagem dinâmica de linhas para evitar pegar valores do cabeçalho
 */
function enviarSemana() {
  try {
    Logger.log("Iniciando enviarSemana");
    
    const ss = SpreadsheetApp.getActive();
    const central = ss.getSheetByName('Central de Treinos');
    const brainer = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER).getSheetByName('log_treinos');
    
    // Obter informações do aluno e da sessão
    const studentId = central.getRange('A1').getValue();
    const studentName = central.getRange('B1').getValue();
    const eventDate = central.getRange('B2').getValue();
    const sessionId = Utilities.getUuid();
    const dias = ['Segunda-Feira','Terça-Feira','Quarta-Feira','Quinta-Feira','Sexta-Feira','Sábado','Domingo'];
    
    Logger.log(`Aluno: ${studentName} (${studentId}), Data: ${eventDate}, Sessão: ${sessionId}`);
    
    // Array para armazenar todos os dados
    let allRowData = [];
    
    // Processar cada dia da semana
    dias.forEach(function(dia) {
      Logger.log(`Processando dia: ${dia}`);
      const rows = montarRowData(central, sessionId, studentId, studentName, eventDate, dia);
      if (rows && rows.length > 0) {
        Logger.log(`${rows.length} registros encontrados para ${dia}`);
        allRowData = allRowData.concat(rows);
      } else {
        Logger.log(`Nenhum registro encontrado para ${dia}`);
      }
    });
    
    // Se existirem registros para enviar
    if (allRowData.length > 0) {
      Logger.log(`Total de ${allRowData.length} registros para enviar`);
      
      // Enviar dados para a planilha Brainer
      const lastRow = brainer.getLastRow();
      if (lastRow > 0) {
        brainer.getRange(lastRow + 1, 1, allRowData.length, allRowData[0].length)
          .setValues(allRowData);
      } else {
        brainer.getRange(1, 1, allRowData.length, allRowData[0].length)
          .setValues(allRowData);
      }
      
      Logger.log("Dados enviados com sucesso para a planilha Brainer");

      // Atualizar a planilha do aluno
      const studentSheetId = getStudentSpreadsheetId(studentId, studentName);
      const result = importarCentralParaWeekly(studentSheetId);
      if (!result.success) {
        throw new Error(result.message);
      }

      Logger.log("Dados enviados com sucesso para a planilha do aluno");
      return { success: true, message: `${allRowData.length} registros enviados com sucesso.` };
    } else {
      Logger.log("Nenhum registro para enviar");
      return { success: false, message: "Nenhum registro para enviar." };
    }
  } catch (error) {
    Logger.log(`Erro ao enviar dados: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return { success: false, message: `Erro ao enviar dados: ${error.message}` };
  }
}

/**
 * Verifica a consistência dos dados entre a planilha do aluno e a planilha Brainer
 * Esta função é usada para debug e garantir que os dados estão sendo gravados da mesma forma
 * em ambas as planilhas
 */
function verificarConsistenciaDados() {
  try {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActive();
    const sheetCentral = ss.getSheetByName(SHEETS.CENTRAL);
    
    if (!sheetCentral) {
      throw new Error('Aba Central de Treinos não encontrada.');
    }
    
    // Obter informações do aluno
    const studentId = sheetCentral.getRange("A1").getValue();
    const studentName = sheetCentral.getRange("B1").getValue();
    
    if (!studentId || !studentName) {
      throw new Error('Preencha o ID e nome do aluno na Central de Treinos.');
    }
    
    // Buscar planilha do aluno
    const studentSheetId = getStudentSpreadsheetId(studentId, studentName);
    const ssAluno = SpreadsheetApp.openById(studentSheetId);
    const sheetWeekly = ssAluno.getSheetByName(SHEETS.WEEKLY);
    
    if (!sheetWeekly) {
      throw new Error(`Aba ${SHEETS.WEEKLY} não encontrada na planilha do aluno.`);
    }
    
    // Buscar planilha Brainer
    const ssBrainer = SpreadsheetApp.openById(IDS.BRAINER);
    const sheetLogBrainer = ssBrainer.getSheetByName(SHEETS.LOG);
    
    if (!sheetLogBrainer) {
      throw new Error(`Aba ${SHEETS.LOG} não encontrada na planilha Brainer.`);
    }
    
    // Buscar dados do aluno na planilha Brainer
    const brainerData = sheetLogBrainer.getDataRange().getValues();
    const brainerHeaders = brainerData[0];
    
    // Filtrar registros do aluno na planilha Brainer (pelo ID ou nome)
    const alunoDataBrainer = [];
    for (let i = 1; i < brainerData.length; i++) {
      if (brainerData[i][2] === studentId || brainerData[i][3] === studentName) {
        alunoDataBrainer.push(brainerData[i]);
      }
    }
    
    if (alunoDataBrainer.length === 0) {
      throw new Error('Nenhum registro encontrado para o aluno na planilha Brainer.');
    }
    
    // Buscar dados da planilha do aluno
    const alunoData = sheetWeekly.getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, 
                                          CONSTANTES.NUM_LINHAS_TREINO_ALUNO, FIELDS.length)
                                .getValues()
                                .filter(row => row[0] !== ''); // Filtrar linhas não vazias
    
    if (alunoData.length === 0) {
      throw new Error('Nenhum registro encontrado na planilha do aluno.');
    }
    
    // Comparar alguns registros para verificar a consistência
    let inconsistencias = [];
    
    // Buscar registros pelo ID_Registro_Unico (primeira coluna)
    for (let i = 0; i < Math.min(alunoData.length, 5); i++) { // Verificar até 5 registros
      const idRegistro = alunoData[i][0];
      
      // Buscar o mesmo registro na planilha Brainer
      let encontrado = false;
      for (let j = 0; j < alunoDataBrainer.length; j++) {
        if (alunoDataBrainer[j][0] === idRegistro) {
          encontrado = true;
          
          // Verificar campos críticos
          const camposCriticos = {
            'objetivo_sessao': 7,
            'Ordem_Exercicio': 8,
            'Nome_Exercicio': 11,
            'Warm_up': 13,
            'Series_Prescritas': 17
          };
          
          // Verificar se os valores são iguais
          for (const [campo, indice] of Object.entries(camposCriticos)) {
            if (alunoData[i][indice] !== alunoDataBrainer[j][indice]) {
              inconsistencias.push({
                id: idRegistro,
                campo: campo,
                valorAluno: alunoData[i][indice],
                valorBrainer: alunoDataBrainer[j][indice]
              });
            }
          }
          
          break;
        }
      }
      
      if (!encontrado) {
        inconsistencias.push({
          id: idRegistro,
          erro: 'Registro não encontrado na planilha Brainer'
        });
      }
    }
    
    // Reportar resultados
    if (inconsistencias.length === 0) {
      ui.alert('Verificação Concluída', 
              'Dados consistentes! Os registros verificados possuem os mesmos valores em ambas as planilhas.',
              ui.ButtonSet.OK);
    } else {
      let mensagem = `Encontradas ${inconsistencias.length} inconsistências:\n\n`;
      inconsistencias.forEach((inc, i) => {
        if (inc.erro) {
          mensagem += `${i+1}. ${inc.erro} (ID: ${inc.id})\n`;
        } else {
          mensagem += `${i+1}. Campo "${inc.campo}" com valores diferentes:\n` +
                      `   - Planilha Aluno: ${inc.valorAluno}\n` +
                      `   - Planilha Brainer: ${inc.valorBrainer}\n`;
        }
      });
      
      ui.alert('Inconsistências Encontradas', mensagem, ui.ButtonSet.OK);
    }
    
    return { success: true, inconsistencias: inconsistencias };
  } catch (error) {
    Logger.log(`Erro na verificação: ${error.message}`);
    SpreadsheetApp.getUi().alert('Erro', `Erro ao verificar consistência: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { success: false, message: error.message };
  }
}

/**
 * Função auxiliar para ser usada via menu
 * Importa dados da Central de Treinos para o aluno selecionado
 */
function menuImportarCentralParaWeekly() {
  const result = importarCentralParaWeekly();
  
  if (result.success) {
    SpreadsheetApp.getUi().alert("Sucesso", result.message, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert("Erro", result.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Função auxiliar para ser usada via menu
 * Verifica a consistência dos dados entre planilhas
 */
function menuVerificarConsistenciaDados() {
  verificarConsistenciaDados();
}
