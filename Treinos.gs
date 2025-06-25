// =============================
// MÓDULO DE LÓGICA DE TREINOS
// =============================

/**
 * Valida entradas obrigatórias.
 * @param {Object} inputs - { key: { value, message } }
 */
function validateInputs(inputs) {
  Object.entries(inputs).forEach(([key, { value, message }]) => {
    // Verificar se o valor existe e não está vazio
    if (!value || value.toString().trim() === '' || 
        value.toString().includes('Selecione') || 
        value.toString().includes('undefined') ||
        value === null || value === undefined) {
      throw new Error(message);
    }
  });
}

/**
 * Busca a primeira linha de um marcador na coluna.
 * @param {string} marker
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} col
 * @param {number} maxRows
 * @returns {number} linha (1-based)
 */
function findFirstRow(marker, sheet, col = 1, maxRows = 50) {
  const data = sheet.getRange(1, col, maxRows, 1).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === marker) return i + 1;
  }
  throw new Error(`Marcador "${marker}" não encontrado na coluna ${col}.`);
}

/**
 * Extrai todos os exercícios da Central de Treinos em lote.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} firstRow
 * @param {number} blockHeight
 * @param {string[]} days
 * @param {number} lastColumn
 * @param {Date} mondayDate
 * @param {string} studentId
 * @param {string} studentName
 * @param {string[]} fields
 * @returns {Object[]} records
 */
function extractExercises(sheet, firstRow, blockHeight, days, lastColumn, mondayDate, studentId, studentName, fields) {
  const allData = sheet.getRange(firstRow, 1, blockHeight * days.length, lastColumn).getValues();
  const records = [];
  const sessionId = Utilities.getUuid();
  
  days.forEach((day, i) => {
    const offset = i * blockHeight;
    const objective = allData[1 + offset][1]; // linha objetivo, coluna B (2)
    let ordem = 1;
    
    for (let r = 3; r < 3 + CONFIG.EXERCISE_ROWS; r++) {
      const row = allData[offset + r];
      const [
        typeActivity, nameExercise, warmUp, rir,
        technique, interval, series, prevReps,
        reps, prevLoad, currLoad, flagIncrease,
        observations
      ] = row;
      
      if (!typeActivity) continue;
      
      const record = {
        ID_Registro_Unico: Utilities.getUuid(),
        ID_Treino_Sessao: sessionId,
        ID_Aluno: studentId,
        Nome_Aluno: studentName,
        Data_Evento: new Date(mondayDate.getTime() + i * 24 * 60 * 60 * 1000),
        Tipo_Registro: 'treino_semanal',
        Dia_Semana: day,
        objetivo_sessao: objective || '',
        Ordem_Exercicio: ordem++,
        Tipo_Atividade: typeActivity || '',
        ID_Exercicio: '',
        Nome_Exercicio: nameExercise || '',
        Instrucao_Progressao: '',
        Warm_up: warmUp || '',
        RiR: rir || '',
        Tecnica_para_Ultima_Serie: technique || '',
        Intervalo: interval || '',
        Series_Prescritas: series || '',
        Repeticoes_prescrita: reps || '',
        Carga_prescrita: currLoad || '',
        Observacoes_personal: observations || '',
        Feedback_aluno: '',
        Repeticoes_realizada: '',
        Carga_realizada: '',
        Warm_up_realizado: '',
        RiR_realizado: '',
        Tecnica_para_Ultima_Serie_realizado: '',
        Intervalo_realizado: ''
      };
      records.push(record);
    }
  });
  
  if (records.length === 0) throw new Error('Preencha pelo menos um exercício na Central de Treinos.');
  return records;
}

/**
 * Busca o ID da planilha do aluno no cadastro ou config Brainer.
 * @param {string} studentId
 * @param {string} studentName
 * @returns {string} spreadsheetId
 */
function getStudentSpreadsheetId(studentId, studentName) {
  Logger.log('Buscando planilha para: ID=' + studentId + ', Nome=' + studentName);
  
  // 1. Cadastro principal
  const master = SpreadsheetApp.openById(IDS.MASTER);
  const sheet = master.getSheetByName(SHEETS.ALUNOS_CADASTRO);
  const data = sheet.getDataRange().getValues();
  
  // Buscar pelas colunas das constantes
  const nameCol = CONSTANTES.COL_NOME_ALUNO_CADASTRO;
  const idCol = CONSTANTES.COL_ID_ALUNO_CADASTRO;
  const sheetIdCol = CONSTANTES.COL_ID_PLANILHA_ALUNO_CADASTRO;
  
  Logger.log('Procurando nas colunas: ID=' + idCol + ', Nome=' + nameCol + ', SheetID=' + sheetIdCol);
  
  for (let i = 1; i < data.length; i++) {
    const rowId = data[i][idCol] ? data[i][idCol].toString().trim() : '';
    const rowName = data[i][nameCol] ? data[i][nameCol].toString().trim() : '';
    const rowSheetId = data[i][sheetIdCol] ? data[i][sheetIdCol].toString().trim() : '';
    
    Logger.log('Linha ' + i + ': ID=' + rowId + ', Nome=' + rowName + ', SheetID=' + rowSheetId);
    
    // Buscar por ID primeiro (mais confiável)
    if (rowId && studentId && rowId.toLowerCase() === studentId.toString().toLowerCase()) {
      if (rowSheetId) {
        Logger.log('Planilha encontrada por ID: ' + rowSheetId);
        return rowSheetId;
      }
    }
    
    // Buscar por nome se não encontrou por ID
    if (rowName && studentName && rowName.toLowerCase() === studentName.toString().toLowerCase()) {
      if (rowSheetId) {
        Logger.log('Planilha encontrada por Nome: ' + rowSheetId);
        return rowSheetId;
      }
    }
  }
  
  // 2. Config Brainer como fallback
  try {
    const brainer = SpreadsheetApp.openById(IDS.BRAINER);
    const config = brainer.getSheetByName(SHEETS.CONFIG);
    if (config) {
      const cdata = config.getDataRange().getValues();
      const cnameCol = cdata[0].indexOf('Nome');
      const cidCol = cdata[0].indexOf('ID');
      const csheetIdCol = cdata[0].indexOf('SpreadsheetID');
      
      for (let i = 1; i < cdata.length; i++) {
        if ((cidCol !== -1 && cdata[i][cidCol] === studentId) ||
            (cnameCol !== -1 && cdata[i][cnameCol] === studentName)) {
          if (csheetIdCol !== -1 && cdata[i][csheetIdCol]) return cdata[i][csheetIdCol];
        }
      }
    }
  } catch (e) {
    Logger.log('Erro ao buscar no Brainer: ' + e.message);
  }
  
  throw new Error('Planilha do aluno não encontrada no cadastro. Verifique se o aluno ' + studentName + ' (ID: ' + studentId + ') está corretamente cadastrado com uma planilha associada.');
}

/**
 * Limpa e escreve os registros na sheet destino.
 * @param {string} sheetId
 * @param {string} sheetName
 * @param {Object[]} records
 * @param {string[]} fields
 */
function writeSheet(sheetId, sheetName, records, fields) {
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Aba "${sheetName}" não encontrada na planilha ${sheetId}`);
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  
  const values = records.map(r => fields.map(f => r[f]));
  if (sheet.getLastColumn() !== fields.length) throw new Error('Número de colunas dos dados não bate com a planilha.');
  
  if (values.length > 0) sheet.getRange(2, 1, values.length, values[0].length).setValues(values);
}

/**
 * Função principal: envia o treino semanal do aluno.
 */
function sendWeeklyWorkout() {
  try {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(SHEETS.CENTRAL);
    
    if (!sheet) {
      throw new Error('Aba "Central de Treinos" não encontrada. Verifique se você está na planilha correta.');
    }
    
    const studentId = sheet.getRange('A1').getValue();
    const studentName = sheet.getRange('B1').getValue();
    const mondayDate = sheet.getRange('B2').getValue();
    
    Logger.log('DEBUG - Valores capturados:');
    Logger.log('- studentId (A1):', studentId);
    Logger.log('- studentName (B1):', studentName);
    Logger.log('- mondayDate (B2):', mondayDate);

    validateInputs({
      studentId: { value: studentId, message: 'Preencha corretamente o ID do aluno na célula A1 da aba "Central de Treinos".' },
      studentName: { value: studentName, message: 'Preencha corretamente o nome do aluno na célula B1 da aba "Central de Treinos".' },
      mondayDate: { value: mondayDate, message: 'Preencha a data de início da semana na célula B2 da aba "Central de Treinos".' }
    });

    const studentSheetId = getStudentSpreadsheetId(studentId, studentName);
    
    // Usar a nova função para importar dados da Central para Weekly
    const result = importarCentralParaWeekly(studentSheetId);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    Logger.log('Treino semanal enviado com sucesso!');
    SpreadsheetApp.getUi().alert('Sucesso', 'Treino enviado com sucesso para ' + studentName + '!', SpreadsheetApp.getUi().ButtonSet.OK);
    return true;
  } catch (e) {
    Logger.log('Erro em sendWeeklyWorkout: ' + e.message);
    SpreadsheetApp.getUi().alert('Erro', 'Erro ao enviar treino: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw e;
  }
}

/**
 * Função principal unificada para enviar treino semanal
 * Esta é a única função necessária para envio de treinos
 */
/**
 * Coleta o feedback preenchido pelo aluno e atualiza o Brainer.
 */
function coletarFeedback() {
  const ui = SpreadsheetApp.getUi();
  try {
    // 1. Obter dados da Central de Treinos
    const ss = SpreadsheetApp.getActive();
    const centralSheet = ss.getSheetByName(SHEETS.CENTRAL);
    
    if (!centralSheet) {
      throw new Error('Aba "Central de Treinos" não encontrada.');
    }
    
    const studentId = centralSheet.getRange('A1').getValue();
    const studentName = centralSheet.getRange('B1').getValue();
    
    if (!studentId || !studentName) {
      throw new Error('Preencha o ID e nome do aluno na Central de Treinos.');
    }
    
    // 2. Buscar planilha do aluno
    const studentSheetId = getStudentSpreadsheetId(studentId, studentName);
    const planilhaAluno = SpreadsheetApp.openById(studentSheetId);
    const abaTreinoAluno = planilhaAluno.getSheetByName(SHEETS.WEEKLY);
    
    if (!abaTreinoAluno) {
      throw new Error('Aba de treino não encontrada na planilha do aluno.');
    }
    
    const dadosAluno = abaTreinoAluno.getDataRange().getValues();

    // 3. Abrir a planilha Brainer
    const planilhaBrainer = SpreadsheetApp.openById(IDS.BRAINER);
    const abaLogBrainer = planilhaBrainer.getSheetByName(SHEETS.LOG);
    const dadosBrainer = abaLogBrainer.getDataRange().getValues();

    // 4. Atualizar registros no Brainer com base no ID_Registro_Unico
    let atualizados = 0;
    for (let i = 1; i < dadosAluno.length; i++) {
      const linhaAluno = dadosAluno[i];
      const idRegistro = linhaAluno[0]; // ID_Registro_Unico na primeira coluna
      
      if (!idRegistro) continue;
      
      for (let j = 1; j < dadosBrainer.length; j++) {
        if (dadosBrainer[j][0] === idRegistro) {
          // Atualizar campos de feedback e realizado (colunas 21-27)
          for (let k = 21; k <= 27; k++) {
            if (linhaAluno[k]) {
              dadosBrainer[j][k] = linhaAluno[k];
            }
          }
          // Tipo_Registro = "Realizado"
          dadosBrainer[j][5] = "Realizado";
          atualizados++;
          break;
        }
      }
    }
    
    // 5. Escrever de volta na planilha Brainer
    if (atualizados > 0) {
      abaLogBrainer.getRange(1, 1, dadosBrainer.length, dadosBrainer[0].length).setValues(dadosBrainer);
      ui.alert('Sucesso', `Feedback coletado com sucesso! ${atualizados} registros atualizados.`, ui.ButtonSet.OK);
    } else {
      ui.alert('Aviso', 'Nenhum feedback novo encontrado para atualizar.', ui.ButtonSet.OK);
    }
    
  } catch (e) {
    Logger.log('Erro em coletarFeedback:', e.message);
    ui.alert('Erro', 'Erro ao coletar feedback: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Carrega o último treino do aluno da planilha Brainer
 */
function carregarUltimoTreinoAluno() {
  try {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActive();
    const centralSheet = ss.getSheetByName(SHEETS.CENTRAL);
    
    if (!centralSheet) {
      throw new Error('Aba "Central de Treinos" não encontrada.');
    }
    
    const studentId = centralSheet.getRange('A1').getValue();
    const studentName = centralSheet.getRange('B1').getValue();
    
    if (!studentId || !studentName) {
      throw new Error('Preencha o ID e nome do aluno na Central de Treinos primeiro.');
    }
    
    // Buscar dados do Brainer
    const brainer = SpreadsheetApp.openById(IDS.BRAINER);
    const logSheet = brainer.getSheetByName(SHEETS.LOG);
    const data = logSheet.getDataRange().getValues();
    
    // Filtrar dados do aluno e pegar os mais recentes
    const alunoData = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === studentId || data[i][3] === studentName) {
        alunoData.push(data[i]);
      }
    }
    
    if (alunoData.length === 0) {
      ui.alert('Aviso', 'Nenhum treino anterior encontrado para este aluno.', ui.ButtonSet.OK);
      return;
    }
    
    // Organizar por data e pegar o último treino
    alunoData.sort((a, b) => new Date(b[4]) - new Date(a[4])); // Ordenar por Data_Evento
    
    // Montar estrutura para Central de Treinos
    const exerciciosPorDia = {};
    CONFIG.DAYS.forEach(day => exerciciosPorDia[day] = []);
    
    alunoData.forEach(row => {
      const dia = row[6]; // Dia_Semana
      if (exerciciosPorDia[dia]) {
        exerciciosPorDia[dia].push({
          tipo: row[9],     // Tipo_Atividade
          nome: row[11],    // Nome_Exercicio
          series: row[17],  // Series_Prescritas
          reps: row[18],    // Repeticoes_prescrita
          carga: row[19],   // Carga_prescrita
          warmup: row[13],  // Warm_up
          rir: row[14],     // RiR
          tecnica: row[15], // Tecnica_para_Ultima_Serie
          intervalo: row[16], // Intervalo
          obs: row[20]      // Observacoes_personal
        });
      }
    });
    
    // Limpar Central de Treinos
    limparCentralTreinos();
    
    // Preencher com os dados carregados
    const firstRow = findFirstRow('Objetivo do Dia', centralSheet);
    let currentRow = firstRow;
    
    CONFIG.DAYS.forEach((day, dayIndex) => {
      const exercicios = exerciciosPorDia[day];
      let exerciseRow = currentRow + 3; // Primeira linha de exercícios
      
      exercicios.forEach((ex, index) => {
        if (index < CONFIG.EXERCISE_ROWS) {
          centralSheet.getRange(exerciseRow + index, 1).setValue(ex.tipo);
          centralSheet.getRange(exerciseRow + index, 2).setValue(ex.nome);
          centralSheet.getRange(exerciseRow + index, 3).setValue(ex.warmup);
          centralSheet.getRange(exerciseRow + index, 4).setValue(ex.rir);
          centralSheet.getRange(exerciseRow + index, 5).setValue(ex.tecnica);
          centralSheet.getRange(exerciseRow + index, 6).setValue(ex.intervalo);
          centralSheet.getRange(exerciseRow + index, 7).setValue(ex.series);
          centralSheet.getRange(exerciseRow + index, 9).setValue(ex.reps);
          centralSheet.getRange(exerciseRow + index, 11).setValue(ex.carga);
          centralSheet.getRange(exerciseRow + index, 13).setValue(ex.obs);
        }
      });
    
      currentRow += CONFIG.BLOCK_HEIGHT;
    });
    
    ui.alert('Sucesso', 'Último treino carregado com sucesso!', ui.ButtonSet.OK);
    
  } catch (e) {
    Logger.log('Erro em carregarUltimoTreinoAluno: ' + e.message);
    SpreadsheetApp.getUi().alert('Erro', 'Erro ao carregar treino: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Monta os dados das linhas com base em linhas dinâmicas, em vez de usar o cabeçalho fixo
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Planilha onde estão os dados
 * @param {string} sessionId - ID da sessão de treino
 * @param {string} studentId - ID do aluno
 * @param {string} studentName - Nome do aluno
 * @param {Date} eventDate - Data do evento
 * @param {string} dayOfWeek - Dia da semana
 * @returns {Array} Lista de arrays de dados para cada linha
 */
function montarRowData(sheet, sessionId, studentId, studentName, eventDate, dayOfWeek) {
  // Determinar a linha inicial e o objetivo da sessão com base no dia da semana
  let startRow, objetivoSessao;
  
  // Mapear o dia da semana para a linha inicial e obter o objetivo da sessão
  switch(dayOfWeek) {
    case 'Segunda-Feira':
      startRow = 8;  // linha onde começam os exercícios de segunda (após o cabeçalho)
      objetivoSessao = sheet.getRange("B6").getValue(); // objetivo está na célula B6
      break;
    case 'Terça-Feira':
      startRow = 22; // linha onde começam os exercícios de terça (após o cabeçalho)
      objetivoSessao = sheet.getRange("B20").getValue(); // objetivo está na célula B20
      break;
    case 'Quarta-Feira':
      startRow = 36; // linha onde começam os exercícios de quarta (após o cabeçalho)
      objetivoSessao = sheet.getRange("B34").getValue(); // objetivo está na célula B34
      break;
    case 'Quinta-Feira':
      startRow = 50; // linha onde começam os exercícios de quinta (após o cabeçalho)
      objetivoSessao = sheet.getRange("B48").getValue(); // objetivo está na célula B48
      break;
    case 'Sexta-Feira':
      startRow = 64; // linha onde começam os exercícios de sexta (após o cabeçalho)
      objetivoSessao = sheet.getRange("B62").getValue(); // objetivo está na célula B62
      break;
    case 'Sábado':
      startRow = 78; // linha onde começam os exercícios de sábado (após o cabeçalho)
      objetivoSessao = sheet.getRange("B76").getValue(); // objetivo está na célula B76
      break;
    case 'Domingo':
      startRow = 92; // linha onde começam os exercícios de domingo (após o cabeçalho)
      objetivoSessao = sheet.getRange("B90").getValue(); // objetivo está na célula B90
      break;
    default:
      Logger.log(`Dia da semana não reconhecido: ${dayOfWeek}`);
      return [];
  }

  // Log para debug
  Logger.log(`Dia: ${dayOfWeek}, startRow: ${startRow} (após o cabeçalho), Objetivo: ${objetivoSessao}`);
  
  // Determinar quantas linhas processar (processamos 10 linhas de exercícios por dia)
  const numLinhasExercicios = 10;
  const rowDataList = [];

  // Processar cada linha de exercício
  for (let i = 0; i < numLinhasExercicios; i++) {
    const dataRow = startRow + i;
    
    // Verificar se a linha possui conteúdo relevante (tipo de atividade ou nome de exercício)
    const tipoAtividade = sheet.getRange(dataRow, 1).getValue();  // Coluna A (Tipo Atividade)
    const nomeExercicio = sheet.getRange(dataRow, 2).getValue();  // Coluna B (Nome Exercício)
    
    // Pula linhas vazias
    if (!tipoAtividade && !nomeExercicio) continue;
    
    // Log para debug
    Logger.log(`Processando linha ${dataRow}: ${tipoAtividade} - ${nomeExercicio}`);

    // Montar o array de dados conforme o mapeamento da consulta
    const rowData = [
      Utilities.getUuid(),                    // 1. ID_Registro_Unico
      sessionId,                              // 2. ID_Treino_Sessao
      studentId,                              // 3. ID_Aluno
      studentName,                            // 4. Nome_Aluno
      eventDate,                              // 5. Data_Evento
      'treino_semanal',                       // 6. Tipo_Registro
      dayOfWeek,                              // 7. Dia_Semana
      objetivoSessao,                         // 8. objetivo_sessao (vem do cabeçalho do bloco, não da linha)
      i + 1,                                  // 9. Ordem_Exercicio (índice da linha no bloco)
      tipoAtividade,                          // 10. Tipo_Atividade (coluna A)
      "",                                     // 11. ID_Exercicio (será preenchido posteriormente)
      nomeExercicio,                          // 12. Nome_Exercicio (coluna B)
      sheet.getRange(dataRow, 12).getValue(), // 13. Instrucao_Progressao (coluna L - aumentar carga/rep)
      sheet.getRange(dataRow, 3).getValue(),  // 14. Warm_up (coluna C)
      sheet.getRange(dataRow, 4).getValue(),  // 15. RiR (coluna D)
      sheet.getRange(dataRow, 5).getValue(),  // 16. Técnica para Última Série (coluna E)
      sheet.getRange(dataRow, 6).getValue(),  // 17. Intervalo (coluna F)
      sheet.getRange(dataRow, 7).getValue(),  // 18. Series_Prescritas (coluna G)
      sheet.getRange(dataRow, 8).getValue(),  // 19. Repetições_prescrita (coluna H)
      sheet.getRange(dataRow, 11).getValue(), // 20. Carga_prescrita (coluna K - carga atual)
      sheet.getRange(dataRow, 13).getValue(), // 21. Observações personal (coluna M)
      "",                                     // 22. Feedback_aluno (vazio, será preenchido no bloco Realizado)
      "",                                     // 23. Repeticoes_realizada
      "",                                     // 24. Carga_realizada
      "",                                     // 25. Warm_up_realizado
      "",                                     // 26. RiR_realizado
      "",                                     // 27. Tecnica_para_Ultima_Serie_realizado
      ""                                      // 28. Intervalo_realizado
    ];

    rowDataList.push(rowData);
    
    // Log adicional para debug
    Logger.log(`Dados linha ${dataRow}: Objetivo: ${rowData[7]}, Tipo: ${rowData[8]}, Nome: ${rowData[11]}`);
  }
  
  Logger.log(`Total de registros processados para ${dayOfWeek}: ${rowDataList.length}`);
  return rowDataList;
}

/**
 * Função para testar e debugar a solução de montarRowData
 * Permite verificar se os valores estão sendo corretamente extraídos das linhas
 */
function debugMontarRowData() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.CENTRAL);
    if (!sheet) {
      throw new Error('Aba Central de Treinos não encontrada');
    }
    
    const studentId = sheet.getRange('A1').getValue();
    const studentName = sheet.getRange('B1').getValue();
    const eventDate = sheet.getRange('B2').getValue();
    const sessionId = Utilities.getUuid();
    const dayOfWeek = 'Segunda-Feira';
    
    Logger.log('========== INICIANDO DEBUG DE montarRowData ==========');
    Logger.log(`Aluno: ${studentName} (ID: ${studentId})`);
    Logger.log(`Data: ${eventDate}, Dia: ${dayOfWeek}, Sessão ID: ${sessionId}`);
    
    // Verificando constantes
    Logger.log('Verificando constantes necessárias:');
    Logger.log(`COL_OBJETIVO_SESSAO: ${CONSTANTES.COL_OBJETIVO_SESSAO}`);
    Logger.log(`COL_TIPO_ATIVIDADE: ${CONSTANTES.COL_TIPO_ATIVIDADE}`);
    Logger.log(`COL_NOME_EXERCICIO: ${CONSTANTES.COL_NOME_EXERCICIO}`);
    Logger.log(`COL_INSTRUCAO_PROGRESSAO: ${CONSTANTES.COL_INSTRUCAO_PROGRESSAO}`);
    
    // Testando o método
    const rowData = montarRowData(sheet, sessionId, studentId, studentName, eventDate, dayOfWeek);
    
    Logger.log(`Total de linhas processadas: ${rowData.length}`);
    
    // Validando alguns resultados
    if (rowData.length > 0) {
      Logger.log('Amostra do primeiro registro:');
      Logger.log(`- ID Único: ${rowData[0][0]}`);
      Logger.log(`- Nome Aluno: ${rowData[0][3]}`);
      Logger.log(`- Dia da Semana: ${rowData[0][6]}`);
      Logger.log(`- Objetivo: ${rowData[0][7]}`);
      Logger.log(`- Ordem Exercício: ${rowData[0][8]}`);
      Logger.log(`- Tipo Atividade: ${rowData[0][9]}`);
      Logger.log(`- Nome Exercício: ${rowData[0][11]}`);
    }
    
    Logger.log('========== TESTE CONCLUÍDO ==========');
    
    SpreadsheetApp.getUi().alert(
      'Debug Concluído', 
      `O teste de montarRowData foi concluído com ${rowData.length} registros processados.\n\nVerifique o log para mais detalhes.`, 
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return rowData.length;
  } catch (error) {
    Logger.log(`ERRO NO DEBUG: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    SpreadsheetApp.getUi().alert(
      'Erro durante o Debug', 
      `Ocorreu um erro durante o teste: ${error.message}`, 
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return 0;
  }
}
