// =============================
// MÓDULO DE GERENCIAMENTO DE ALUNOS
// =============================
const CONSTANTES = require('./constants');
const utils = require('./utils');

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
    const camposObrigatorios = [
      { campo: 'nomeCompleto', label: 'Nome Completo' },
      { campo: 'email', label: 'E-mail' },
      { campo: 'whatsapp', label: 'Whatsapp' },
      { campo: 'dataInicio', label: 'Data de Início' },
      { campo: 'objetivo', label: 'Objetivo' }
    ];
    const camposVazios = camposObrigatorios.filter(c => !formData[c.campo] || !formData[c.campo].toString().trim());
    if (camposVazios.length > 0) {
      throw new Error('Os seguintes campos são obrigatórios e não foram preenchidos: ' +
        camposVazios.map(c => c.label).join(', '));
    }
    const planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    const abaAlunos = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    const novoId = gerarProximoIdAluno_();
    const template = DriveApp.getFileById(CONSTANTES.ID_TEMPLATE_ALUNO);
    const pastaDestino = DriveApp.getFolderById(CONSTANTES.ID_PASTA_ALUNOS_ATIVOS);
    const novaPlanilha = template.makeCopy(`[${formData.nomeCompleto}] - Plano de Treino`, pastaDestino);
    novaPlanilha.addEditor(formData.email);
    const urlNovaPlanilha = novaPlanilha.getUrl();
    protegerPlanilhaAluno_(novaPlanilha.getId());
    const dataInicio = new Date(formData.dataInicio + 'T12:00:00');
    const dataVencimento = new Date(dataInicio);
    dataVencimento.setDate(dataVencimento.getDate() + 30);
    const novaLinha = [
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
    return `Aluno ${formData.nomeCompleto} cadastrado com sucesso!`;
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
    const planilhaAluno = SpreadsheetApp.openById(idPlanilha);
    const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
    if (abaTreino) {
      const protection = abaTreino.protect().setDescription('Estrutura do Treino');
      protection.removeEditors(protection.getEditors());
      protection.addEditor(Session.getEffectiveUser());
      const todosIntervalosNomeados = planilhaAluno.getNamedRanges();
      const rangesEditaveis = [];
      for (const intervalo of todosIntervalosNomeados) {
        if (intervalo.getName().toLowerCase().startsWith('feedback_')) {
          rangesEditaveis.push(intervalo.getRange());
        }
      }
      if (rangesEditaveis.length > 0) {
        protection.setUnprotectedRanges(rangesEditaveis);
      }
    }
    const abasParaProtegerTotalmente = [
      CONSTANTES.ABA_HISTORICO_ALUNO,
      CONSTANTES.ABA_DADOS_ALUNO,
      CONSTANTES.ABA_AUX_ALUNO
    ];
    abasParaProtegerTotalmente.forEach(nomeAba => {
      const aba = planilhaAluno.getSheetByName(nomeAba);
      if (aba) {
        const protection = aba.protect().setDescription('Aba protegida');
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
  const scriptProperties = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    let ultimoId = parseInt(scriptProperties.getProperty('ULTIMO_ID_ALUNO') || '0');
    ultimoId++;
    scriptProperties.setProperty('ULTIMO_ID_ALUNO', ultimoId.toString());
    const idFormatado = 'AL' + ultimoId.toString().padStart(3, '0');
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
    const hoje = new Date();
    if (hoje > dataVencimento) {
      const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
      planilhaAluno.getSheets().forEach(sheet => {
        const protection = sheet.protect().setDescription('Acesso vencido');
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
    const scriptProperties = PropertiesService.getScriptProperties();
    if (!scriptProperties.getProperty('ULTIMO_ID_ALUNO')) {
      scriptProperties.setProperty('ULTIMO_ID_ALUNO', '0');
    }
  } catch (e) {
    Logger.log('Error in inicializarContadorDeAlunos:', e);
    throw new Error('Erro em inicializarContadorDeAlunos: Falha ao inicializar contador. Detalhe: ' + e.message);
  }
}

module.exports = {
  processarFormularioDeCadastro,
  protegerPlanilhaAluno_,
  gerarProximoIdAluno_,
  verificarAcessoPorVencimento_,
  inicializarContadorDeAlunos
};
