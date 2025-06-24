// =============================
// MÓDULO DE GERENCIAMENTO DE ALUNOS
// =============================

/**
 * Processa os dados recebidos do formulário HTML para cadastrar um novo aluno.
 * @param {Object} formData - O objeto com os dados do aluno vindos do formulário.
 * @param {string} formData.nomeCompleto
 * @param {string} formData.email
 * @param {string} formData.whatsapp
 * @param {string} formData.dataInicio
 * @param {string} formData.objetivo
 * @param {string} [formData.observacoes]
 * @returns {string} Uma mensagem de sucesso.
 * @throws {Error} Se algum campo obrigatório estiver faltando ou ocorrer erro no cadastro.
 */
function processarFormularioDeCadastro(formData) {
  try {
    var camposObrigatorios = [
      { campo: 'nomeCompleto', label: 'Nome Completo' },
      { campo: 'email', label: 'E-mail' },
      { campo: 'whatsapp', label: 'Whatsapp' },
      { campo: 'dataInicio', label: 'Data de Início' },
      { campo: 'objetivo', label: 'Objetivo' }
    ];
    var camposVazios = camposObrigatorios.filter(function(c) {
      return !formData[c.campo] || !formData[c.campo].toString().trim();
    });
    if (camposVazios.length > 0) {
      throw new Error('Os seguintes campos são obrigatórios e não foram preenchidos: ' +
        camposVazios.map(function(c) { return c.label; }).join(', '));
    }
    var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    var abaAlunos = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    var novoId = gerarProximoIdAluno_();
    var template = DriveApp.getFileById(CONSTANTES.ID_TEMPLATE_ALUNO);
    var pastaDestino = DriveApp.getFolderById(CONSTANTES.ID_PASTA_ALUNOS_ATIVOS);
    var novaPlanilha = template.makeCopy('[' + formData.nomeCompleto + '] - Plano de Treino', pastaDestino);
    novaPlanilha.addEditor(formData.email);
    var urlNovaPlanilha = novaPlanilha.getUrl();
    protegerPlanilhaAluno_(novaPlanilha.getId());
    var dataInicio = new Date(formData.dataInicio + 'T12:00:00');
    var dataVencimento = new Date(dataInicio);
    dataVencimento.setDate(dataVencimento.getDate() + 30);
    var novaLinha = [
      novoId,
      formData.nomeCompleto,
      formData.email,
      formData.whatsapp,
      dataInicio,
      'Ativo',
      formData.objetivo,
      novaPlanilha.getId(),
      dataVencimento,
      formData.observacoes
    ];
    abaAlunos.appendRow(novaLinha);
    return 'Aluno ' + formData.nomeCompleto + ' cadastrado com sucesso!';
  } catch (e) {
    Logger.log('Error in processarFormularioDeCadastro:', e);
    throw new Error('Erro em processarFormularioDeCadastro: Falha ao cadastrar aluno. Detalhe: ' + e.message);
  }
}

/**
 * Aplica proteção na planilha do aluno, deixando apenas os intervalos nomeados de feedback editáveis.
 * @param {string} idPlanilha - A ID da planilha do aluno a ser protegida.
 * @throws {Error} Se ocorrer erro ao proteger a planilha.
 * @private
 */
function protegerPlanilhaAluno_(idPlanilha) {
  try {
    var planilhaAluno = SpreadsheetApp.openById(idPlanilha);
    var abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
    if (abaTreino) {
      var protection = abaTreino.protect().setDescription('Estrutura do Treino');
      protection.removeEditors(protection.getEditors());
      protection.addEditor(Session.getEffectiveUser());
      var todosIntervalosNomeados = planilhaAluno.getNamedRanges();
      var rangesEditaveis = [];
      for (var i = 0; i < todosIntervalosNomeados.length; i++) {
        var intervalo = todosIntervalosNomeados[i];
        if (intervalo.getName().toLowerCase().indexOf('feedback_') === 0) {
          rangesEditaveis.push(intervalo.getRange());
        }
      }
      if (rangesEditaveis.length > 0) {
        protection.setUnprotectedRanges(rangesEditaveis);
      }
    }
    var abasParaProtegerTotalmente = [
      CONSTANTES.ABA_HISTORICO_ALUNO,
      CONSTANTES.ABA_DADOS_ALUNO,
      CONSTANTES.ABA_AUX_ALUNO
    ];
    abasParaProtegerTotalmente.forEach(function(nomeAba) {
      var aba = planilhaAluno.getSheetByName(nomeAba);
      if (aba) {
        var protection = aba.protect().setDescription('Aba protegida');
        protection.removeEditors(protection.getEditors());
        protection.addEditor(Session.getEffectiveUser());
      }
    });
  } catch (e) {
    Logger.log('Error in protegerPlanilhaAluno_:', e);
    throw new Error('Erro em protegerPlanilhaAluno_: Falha ao proteger planilha do aluno. Detalhe: ' + e.message);
  }
}

/**
 * Gera um ID de aluno sequencial e único.
 * @returns {string} O novo ID de aluno.
 * @throws {Error} Se ocorrer erro ao gerar o ID.
 * @private
 */
function gerarProximoIdAluno_() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ultimoId = parseInt(scriptProperties.getProperty('ULTIMO_ID_ALUNO') || '0');
    ultimoId++;
    scriptProperties.setProperty('ULTIMO_ID_ALUNO', ultimoId.toString());
    var idFormatado = 'AL' + ultimoId.toString().padStart(3, '0');
    return idFormatado;
  } catch (e) {
    Logger.log('Error in gerarProximoIdAluno_:', e);
    throw new Error('Erro em gerarProximoIdAluno_: Falha ao gerar novo ID. Detalhe: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Verifica se o acesso do aluno está vencido e bloqueia a edição se necessário.
 * @param {string} idPlanilhaAluno
 * @param {Date} dataVencimento
 * @throws {Error} Se ocorrer erro ao verificar acesso.
 * @private
 */
function verificarAcessoPorVencimento_(idPlanilhaAluno, dataVencimento) {
  try {
    var hoje = new Date();
    if (hoje > dataVencimento) {
      var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
      planilhaAluno.getSheets().forEach(function(sheet) {
        var protection = sheet.protect().setDescription('Acesso vencido');
        protection.removeEditors(protection.getEditors());
        protection.addEditor(Session.getEffectiveUser());
      });
    }
  } catch (e) {
    Logger.log('Error in verificarAcessoPorVencimento_:', e);
    throw new Error('Erro em verificarAcessoPorVencimento_: Falha ao verificar acesso. Detalhe: ' + e.message);
  }
}

/**
 * Inicializa o contador de IDs de alunos, caso ainda não exista.
 * @throws {Error} Se ocorrer erro ao inicializar o contador.
 */
function inicializarContadorDeAlunos() {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    if (!scriptProperties.getProperty('ULTIMO_ID_ALUNO')) {
      scriptProperties.setProperty('ULTIMO_ID_ALUNO', '0');
    }
  } catch (e) {
    Logger.log('Error in inicializarContadorDeAlunos:', e);
    throw new Error('Erro em inicializarContadorDeAlunos: Falha ao inicializar contador. Detalhe: ' + e.message);
  }
}

/**
 * Obtém informações de um aluno pelo ID
 * @param {string} idAluno - ID do aluno
 * @returns {Object|null} Informações do aluno ou null se não encontrado
 */
function obterInfoAluno(idAluno) {
  try {
    var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    var abaCadastro = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    
    if (!abaCadastro) {
      logError('Aba de cadastro não encontrada', null, {abaName: CONSTANTES.ABA_ALUNOS_CADASTRO});
      return null;
    }
    
    var dados = abaCadastro.getDataRange().getValues();
    for (var i = 1; i < dados.length; i++) {
      if (dados[i][0] === idAluno) {
        return {
          id: dados[i][0],
          nome: dados[i][1],
          email: dados[i][2],
          whatsapp: dados[i][3],
          dataInicio: dados[i][4],
          status: dados[i][5],
          objetivo: dados[i][6],
          idPlanilha: dados[i][7],
          dataVencimento: dados[i][8]
        };
      }
    }
    
    logInfo('Aluno não encontrado', {idAluno: idAluno});
    return null;
  } catch (e) {
    logError('Erro ao obter informações do aluno', e, {idAluno: idAluno});
    return null;
  }
}
