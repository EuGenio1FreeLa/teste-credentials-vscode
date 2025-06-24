// =============================
// MÓDULO DE LÓGICA DE TREINOS
// =============================

/**
 * Função principal para enviar o treino semanal do aluno.
 * - Usa constantes para nomes de abas e IDs.
 * - Remove/aplica proteção.
 * - Limpa conteúdo antigo.
 * - Registra cada exercício no log.
 * - Verifica sobrescrita de dados do aluno.
 * - Usa funções auxiliares.
 */
function enviarTreinoSemanal() {
  var ui = SpreadsheetApp.getUi();
  try {
    // 1. Obter aluno selecionado e validar
    var aluno = obterAlunoSelecionado();
    if (!aluno) {
      showAlert('Selecione um aluno.');
      return;
    }
    var idPlanilhaAluno = obterIdPlanilhaAluno(aluno);
    if (!idPlanilhaAluno) {
      showAlert('Planilha do aluno não encontrada.');
      return;
    }
    // 2. Obter dados da Central de Treinos
    var dadosCentral = lerDadosCentralTreinos();
    if (!dadosCentral || dadosCentral.length === 0) {
      showAlert('Preencha o treino na Central de Treinos antes de enviar.');
      return;
    }
    // Geração de IDs únicos e preenchimento dos campos obrigatórios
    var timestampSessao = new Date().getTime();
    dadosCentral = dadosCentral.map(function(linha, idx) {
      var idRegistro = timestampSessao + '_' + (idx + 1);
      // Preencher campos obrigatórios conforme padrão do projeto
      linha[CONSTANTES.COL_ID_REGISTRO_UNICO] = idRegistro;
      linha[CONSTANTES.COL_ID_TREINO_SESSAO] = timestampSessao;
      linha[CONSTANTES.COL_TIPO_REGISTRO] = "Prescrito";
      // Limpar campos de realizado/feedback
      if (Array.isArray(CONSTANTES.COLUNAS_REALIZADO_FEEDBACK)) {
        for (var i = 0; i < CONSTANTES.COLUNAS_REALIZADO_FEEDBACK.length; i++) {
          var col = CONSTANTES.COLUNAS_REALIZADO_FEEDBACK[i];
          linha[col] = "";
        }
      }
      return linha;
    });
    // 3. Abrir planilha do aluno e da planilha de log
    var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
    var abaTreinoAluno = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
    var planilhaMae = SpreadsheetApp.getActiveSpreadsheet();
    var abaCentral = planilhaMae.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
    var abaLog = planilhaMae.getSheetByName(CONSTANTES.ABA_LOG_ACOES);

    // 4. Proteção: remover temporariamente
    var protecaoAluno, protecaoLog;
    try {
      protecaoAluno = abaTreinoAluno.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
      if (protecaoAluno) protecaoAluno.remove();
      protecaoLog = abaLog.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
      if (protecaoLog) protecaoLog.remove();
    } catch (e) {}

    // 5. Verificar se já existem dados preenchidos pelo aluno
    var dadosAluno = lerSemanaAtualAluno(idPlanilhaAluno);
    var sobrescrever = true;
    if (dadosAluno && dadosAluno.length > 0) {
      var resposta = ui.alert(
        'Dados já preenchidos',
        'Já existem dados preenchidos na semana atual do aluno. Deseja sobrescrever?\n\nClique em "Sim" para sobrescrever, "Não" para cancelar.',
        ui.ButtonSet.YES_NO
      );
      if (resposta !== ui.Button.YES) {
        showAlert('Envio de treino cancelado.');
        return;
      }
      apagarSemanaAtualAluno(idPlanilhaAluno);
    }

    // 6. Escrever treino na planilha do aluno
    escreverTreinoAluno(idPlanilhaAluno, dadosCentral);

    // 7. Registrar treino no log
    registrarTreinoBrainer(aluno, dadosCentral);

    // 8. Limpar Central de Treinos
    limparCentralTreinos();

    showAlert('Treino enviado com sucesso!');
  } catch (e) {
    Logger.log('Error in enviarTreinoSemanal:', e);
    SpreadsheetApp.getUi().alert('Erro ao enviar treino: ' + e.message);
  } finally {
    // Reaplicar proteções
    try {
      var planilhaAluno = SpreadsheetApp.openById(obterIdPlanilhaAluno(obterAlunoSelecionado()));
      var abaTreinoAluno = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
      if (abaTreinoAluno && !abaTreinoAluno.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) {
        var prot = abaTreinoAluno.protect();
        prot.setWarningOnly(false);
      }
      var planilhaMae = SpreadsheetApp.getActiveSpreadsheet();
      var abaLog = planilhaMae.getSheetByName(CONSTANTES.ABA_LOG_ACOES);
      if (abaLog && !abaLog.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) {
        var prot = abaLog.protect();
        prot.setWarningOnly(false);
      }
    } catch (e) {}
  }
}

/**
 * Coleta o feedback preenchido pelo aluno e atualiza o Brainer.
 */
function coletarFeedback() {
  var ui = SpreadsheetApp.getUi();
  try {
    // 1. Obter aluno selecionado e validar
    var aluno = obterAlunoSelecionado();
    if (!aluno) {
      showAlert('Selecione um aluno.');
      return;
    }
    var idPlanilhaAluno = obterIdPlanilhaAluno(aluno);
    if (!idPlanilhaAluno) {
      showAlert('Planilha do aluno não encontrada.');
      return;
    }
    // 2. Ler todos os dados da aba de treino do aluno
    var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
    var abaTreinoAluno = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
    var dadosAluno = abaTreinoAluno.getDataRange().getValues();

    // 3. Abrir a planilha Brainer (log global)
    var planilhaBrainer = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER);
    var abaLogBrainer = planilhaBrainer.getSheetByName(CONSTANTES.ABA_LOG_TREINOS_BRAINER);
    var dadosBrainer = abaLogBrainer.getDataRange().getValues();

    // 4. Atualizar registros no Brainer com base no ID_Registro_Unico
    var atualizados = 0;
    for (var i = 1; i < dadosAluno.length; i++) {
      var linhaAluno = dadosAluno[i];
      var idRegistro = linhaAluno[CONSTANTES.COL_ID_REGISTRO_UNICO];
      if (!idRegistro) continue;
      for (var j = 1; j < dadosBrainer.length; j++) {
        if (dadosBrainer[j][CONSTANTES.COL_ID_REGISTRO_UNICO] === idRegistro) {
          // Atualizar campos de realizado e feedback
          for (var k = 0; k < CONSTANTES.COLUNAS_REALIZADO_FEEDBACK.length; k++) {
            var idx = CONSTANTES.COLUNAS_REALIZADO_FEEDBACK[k];
            dadosBrainer[j][idx] = linhaAluno[idx];
          }
          // Tipo_Registro = "Realizado"
          dadosBrainer[j][CONSTANTES.COL_TIPO_REGISTRO] = "Realizado";
          atualizados++;
          break;
        }
      }
    }
    // 5. Escrever de volta na planilha Brainer
    if (atualizados > 0) {
      abaLogBrainer.getRange(1, 1, dadosBrainer.length, dadosBrainer[0].length).setValues(dadosBrainer);
    }
    showAlert('Feedback coletado e arquivado com sucesso!');
  } catch (e) {
    Logger.log('Error in coletarFeedback:', e);
    SpreadsheetApp.getUi().alert('Erro ao coletar feedback: ' + e.message);
  }
}

/**
 * Obtém o nome do aluno selecionado no dropdown da Central de Treinos.
 */
function obterAlunoSelecionado() {
  try {
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
    
    if (!aba) {
      Logger.log('Aba Central de Treinos não encontrada: ' + CONSTANTES.ABA_CENTRAL_TREINOS);
      return null;
    }
    
    var valorCelula = aba.getRange(CONSTANTES.CELULA_DROPDOWN_ALUNO).getValue();
    Logger.log('Valor na célula dropdown (' + CONSTANTES.CELULA_DROPDOWN_ALUNO + '): ' + valorCelula);
    
    return valorCelula;
  } catch (e) {
    Logger.log('Erro ao obter aluno selecionado: ' + e.message);
    return null;
  }
}

/**
 * Busca o ID da planilha do aluno no cadastro.
 * CORREÇÃO: Agora usa a planilha mãe diretamente via ID ao invés de getActiveSpreadsheet
 */
function obterIdPlanilhaAluno(nomeAluno) {
  try {
    var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    var abaCadastro = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    
    if (!abaCadastro) {
      logError('Aba de cadastro não encontrada', null, {abaName: CONSTANTES.ABA_ALUNOS_CADASTRO});
      return null;
    }
    
    var dados = abaCadastro.getDataRange().getValues();
    logInfo('Procurando aluno: ' + nomeAluno + ' no cadastro...');
    
    for (var i = 1; i < dados.length; i++) {
      var nomeNoCadastro = dados[i][CONSTANTES.COL_NOME_ALUNO_CADASTRO];
      var idPlanilha = dados[i][CONSTANTES.COL_ID_PLANILHA_ALUNO_CADASTRO];
      
      logInfo('Verificando linha ' + i, {nome: nomeNoCadastro, id: idPlanilha});
      
      if (nomeNoCadastro === nomeAluno && idPlanilha) {
        logInfo('Aluno encontrado! ID da planilha: ' + idPlanilha);
        return idPlanilha;
      }
    }
    
    logError('Aluno não encontrado no cadastro', null, {nomeAluno: nomeAluno});
    return null;
  } catch (e) {
    logError('Erro ao buscar ID da planilha do aluno', e, {nomeAluno: nomeAluno});
    return null;
  }
}

/**
 * Lê os dados da Central de Treinos (linhas de treino preenchidas).
 */
function lerDadosCentralTreinos() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  var dados = aba.getRange(CONSTANTES.LINHA_INICIO_TREINO_CENTRAL, 1, CONSTANTES.NUM_LINHAS_TREINO_CENTRAL, aba.getLastColumn()).getValues();
  return dados.filter(function(linha) {
    return linha[CONSTANTES.COL_NOME_EXERCICIO_CENTRAL] && linha[CONSTANTES.COL_NOME_EXERCICIO_CENTRAL].toString().trim() !== '';
  });
}

/**
 * Lê os dados da semana atual do aluno.
 */
function lerSemanaAtualAluno(idPlanilhaAluno) {
  var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  var abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  var dados = abaTreino.getDataRange().getValues();
  // Considera preenchido se houver algum exercício na semana
  return dados.filter(function(linha) {
    return linha[CONSTANTES.COL_NOME_EXERCICIO_ALUNO] && linha[CONSTANTES.COL_NOME_EXERCICIO_ALUNO].toString().trim() !== '';
  });
}

/**
 * Apaga a semana atual do aluno (limpa a área de treino).
 */
function apagarSemanaAtualAluno(idPlanilhaAluno) {
  var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  var abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  abaTreino.getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, CONSTANTES.NUM_LINHAS_TREINO_ALUNO, abaTreino.getLastColumn()).clearContent();
}

/**
 * Escreve o treino na planilha do aluno.
 */
function escreverTreinoAluno(idPlanilhaAluno, dados) {
  var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  var abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  abaTreino.getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, dados.length, dados[0].length).setValues(dados);
}

/**
 * Registra o treino no log (Brainer).
 */
function registrarTreinoBrainer(aluno, dados) {
  try {
    // Para o ambiente do Google Apps Script, vamos registrar na aba de log da planilha atual
    var planilhaMae = SpreadsheetApp.getActiveSpreadsheet();
    var abaLog = planilhaMae.getSheetByName(CONSTANTES.ABA_LOG_ACOES);
    
    if (!abaLog) {
      Logger.log('Aba de log não encontrada: ' + CONSTANTES.ABA_LOG_ACOES);
      return;
    }
    
    var timestamp = new Date();
    Logger.log('Registrando ' + dados.length + ' exercícios no log para o aluno: ' + aluno);
    
    dados.forEach(function(linha) {
      var logRow = [
        timestamp,
        aluno,
        linha[CONSTANTES.COL_TIPO_ATIVIDADE_CENTRAL] || '',
        linha[CONSTANTES.COL_NOME_EXERCICIO_CENTRAL] || '',
        linha[CONSTANTES.COL_REPETICOES_CENTRAL] || '',
        linha[CONSTANTES.COL_CARGA_CENTRAL] || '',
        linha[CONSTANTES.COL_ID_TREINO_SESSAO] || '',
        linha[CONSTANTES.COL_ID_REGISTRO_UNICO] || '',
        linha[CONSTANTES.COL_TIPO_REGISTRO] || 'Prescrito'
      ];
      abaLog.appendRow(logRow);
    });
    
    Logger.log('Treino registrado no log com sucesso');
  } catch (e) {
    Logger.log('Erro ao registrar treino no log: ' + e.message);
    // Não vamos falhar o envio por causa do log
  }
}

/**
 * Limpa a Central de Treinos.
 */
function limparCentralTreinos() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  aba.getRange(CONSTANTES.LINHA_INICIO_TREINO_CENTRAL, 1, CONSTANTES.NUM_LINHAS_TREINO_CENTRAL, aba.getLastColumn()).clearContent();
}

/**
 * Busca o último treino enviado para o aluno na planilha Brainer.
 * Retorna um array de linhas prontas para preencher a Central de Treinos.
 */
function buscarUltimoTreinoAlunoBrainer(nomeAluno) {
  var planilhaBrainer = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER);
  var abaLogBrainer = planilhaBrainer.getSheetByName(CONSTANTES.ABA_LOG_TREINOS_BRAINER);
  var dados = abaLogBrainer.getDataRange().getValues();
  // Filtra só os treinos do aluno
  var treinosAluno = dados.filter(function(linha) {
    return linha[CONSTANTES.COL_NOME_ALUNO_BRAINER] === nomeAluno;
  });
  if (treinosAluno.length === 0) return [];
  // Agrupa por sessão (ID_Treino_Sessao ou Timestamp)
  // Supondo que existe uma coluna de sessão ou timestamp
  var idxSessao = CONSTANTES.COL_ID_TREINO_SESSAO_BRAINER || CONSTANTES.COL_TIMESTAMP_BRAINER;
  // Ordena por timestamp/sessão decrescente
  treinosAluno.sort(function(a, b) { return b[idxSessao] - a[idxSessao]; });
  var ultimaSessao = treinosAluno[0][idxSessao];
  // Pega todos os exercícios da última sessão
  var ultimoTreino = treinosAluno.filter(function(linha) {
    return linha[idxSessao] === ultimaSessao;
  });
  // Mapeia para o formato da Central de Treinos
  return ultimoTreino.map(function(linha) {
    return [
      linha[CONSTANTES.COL_TIPO_ATIVIDADE_BRAINER],
      linha[CONSTANTES.COL_NOME_EXERCICIO_BRAINER],
      linha[CONSTANTES.COL_REPETICOES_BRAINER],
      linha[CONSTANTES.COL_CARGA_BRAINER]
      // ...adicione outros campos conforme necessário...
    ];
  });
}

/**
 * Carrega o último treino de um aluno na Central de Treinos
 */
function carregarUltimoTreinoAluno() {
  try {
    var aluno = obterAlunoSelecionado();
    if (!aluno) {
      showAlert('Selecione um aluno primeiro.');
      return;
    }
    
    var ultimoTreino = buscarUltimoTreinoAlunoBrainer(aluno);
    if (!ultimoTreino || ultimoTreino.length === 0) {
      showAlert('Nenhum treino anterior encontrado para este aluno.');
      return;
    }
    
    // Limpar central de treinos
    limparCentralTreinos();
    
    // Carregar dados na central
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
    var range = aba.getRange(CONSTANTES.LINHA_INICIO_TREINO_CENTRAL, 1, ultimoTreino.length, ultimoTreino[0].length);
    range.setValues(ultimoTreino);
    
    showAlert('Último treino carregado com sucesso! (' + ultimoTreino.length + ' exercícios)');
  } catch (e) {
    Logger.log('Error in carregarUltimoTreinoAluno:', e);
    showAlert('Erro ao carregar último treino: ' + e.message);
  }
}

/**
 * Envia treino para um aluno específico via API
 * @param {string} idAluno - ID do aluno
 * @param {Object} dadosTreino - Dados do treino a enviar
 * @returns {Object} Resultado da operação
 */
function enviarTreino(idAluno, dadosTreino) {
  try {
    logInfo('Iniciando envio de treino', {idAluno, treino: dadosTreino});
    
    // Obter ID da planilha do aluno
    const idPlanilha = obterIdPlanilhaAluno(idAluno);
    if (!idPlanilha) {
      throw new Error('Planilha do aluno não encontrada');
    }
    
    // Obter informações do aluno para envio
    const infoAluno = obterInfoAluno(idAluno);
    if (!infoAluno) {
      throw new Error('Informações do aluno não encontradas');
    }
    
    // Gerar IDs únicos para o treino
    var timestampSessao = new Date().getTime();
    dadosTreino = dadosTreino.map(function(linha, idx) {
      var idRegistro = timestampSessao + '_' + (idx + 1);
      linha.id = idRegistro;
      linha.sessao = timestampSessao;
      return linha;
    });
    
    // Registrar treino na planilha do aluno
    var planilhaAluno = SpreadsheetApp.openById(idPlanilha);
    var abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
    
    // TODO: Implementar conversão dos dados do formato API para formato da planilha
    
    // Registrar envio no histórico da planilha mãe
    // TODO: Implementar registro no histórico
    
    logInfo('Treino enviado com sucesso', {idAluno});
    return { success: true, message: 'Treino enviado com sucesso' };
  } catch (error) {
    logError('Erro ao enviar treino', error, {idAluno});
    return { success: false, message: 'Erro ao enviar treino: ' + error.message };
  }
}

/**
 * Registra feedback do treino recebido do aluno
 * @param {string} idAluno - ID do aluno
 * @param {string} idTreino - ID do treino
 * @param {Object} dadosFeedback - Dados do feedback
 * @returns {Object} Resultado da operação
 */
function registrarFeedbackTreino(idAluno, idTreino, dadosFeedback) {
  try {
    logInfo('Registrando feedback', {idAluno, idTreino, feedback: dadosFeedback});
    
    // Obter ID da planilha do aluno
    const idPlanilha = obterIdPlanilhaAluno(idAluno);
    if (!idPlanilha) {
      throw new Error('Planilha do aluno não encontrada');
    }
    
    // Atualizar planilha do aluno com o feedback
    const ss = SpreadsheetApp.openById(idPlanilha);
    const sheetTreinos = ss.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
    const treinos = sheetTreinos.getDataRange().getValues();
    
    // Encontrar o treino específico
    let linhaEncontrada = -1;
    for (let i = 1; i < treinos.length; i++) {
      if (treinos[i][0] === idTreino) { // Coluna A = ID do treino
        linhaEncontrada = i + 1; // +1 porque os índices começam em 0 mas as linhas em 1
        break;
      }
    }
    
    if (linhaEncontrada === -1) {
      throw new Error('Treino não encontrado na planilha');
    }
    
    // Atualizar as colunas de feedback
    sheetTreinos.getRange(linhaEncontrada, 8).setValue(dadosFeedback.dificuldade); // Coluna H
    sheetTreinos.getRange(linhaEncontrada, 9).setValue(dadosFeedback.comentario); // Coluna I
    sheetTreinos.getRange(linhaEncontrada, 10).setValue(new Date()); // Coluna J - Data do feedback
    
    logInfo('Feedback registrado com sucesso', {idAluno, idTreino});
    return { success: true, message: 'Feedback registrado com sucesso' };
  } catch (error) {
    logError('Erro ao registrar feedback', error, {idAluno, idTreino});
    return { success: false, message: 'Erro ao registrar feedback: ' + error.message };
  }
}
