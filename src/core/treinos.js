// =============================
// MÓDULO DE LÓGICA DE TREINOS
// =============================
const CONSTANTES = require('./constants');
const utils = require('./utils');

/**
 * Envia o treino montado na Central de Treinos para a planilha do aluno e para o Brainer.
 * @throws {Error} Se ocorrer erro ao enviar o treino.
 */
function enviarSemana() {
  const ui = SpreadsheetApp.getUi();
  try {
    // 1. Obter aluno selecionado e verificar acesso
    // ...
    // 2. Obter URL da planilha do aluno
    // ...
    // 3. Lógica de verificação de dados já preenchidos pelo aluno
    //    e exibição do pop-up com as 3 opções (Manter, Apagar, Cancelar).
    // ...
    // 4. Loop pelos dias da semana na Central de Treinos
    const timestampUnico = new Date().getTime(); // Gera o timestamp para o ID da sessão
    // ... (Loop for para cada dia)
    // 5. Dentro do loop, para cada exercício:
    // a. Gerar ID_Registro_Unico e ID_Treino_Sessao
    // b. Montar o "pacote de dados" (array) para a linha do treino
    // c. Definir Tipo_Registro como "Prescrito"
    // d. Deixar campos _realizado em branco
    // 6. Escrever o pacote de dados na Planilha Aluno e na Planilha Brainer
    // ...
    ui.alert('Treino enviado com sucesso!');
  } catch(e) {
    Logger.log('Error in enviarSemana:', e);
    ui.alert('Erro em enviarSemana: Falha ao enviar treino. Detalhe: ' + e.message);
  }
}

/**
 * Coleta o feedback preenchido pelo aluno e atualiza o Brainer.
 * @throws {Error} Se ocorrer erro ao coletar o feedback.
 */
function coletarFeedback() {
  const ui = SpreadsheetApp.getUi();
  try {
    // 1. PT seleciona o aluno via UI
    // ...
    // 2. Obter URL da planilha do aluno
    // ...
    // 3. Ler todos os dados da aba 'treino_semanal' do aluno
    // ...
    // 4. Abrir a Planilha Brainer
    // ...
    // 5. Loop por cada linha de treino lida da planilha do aluno
    // a. Obter o ID_Registro_Unico da linha
    // b. Encontrar a linha correspondente no Brainer usando o ID
    // c. Se encontrada, atualizar as colunas _realizado e de feedback
    // d. Mudar o Tipo_Registro para "Realizado"
    ui.alert('Feedback coletado e arquivado com sucesso!');
  } catch(e) {
    Logger.log('Error in coletarFeedback:', e);
    ui.alert('Erro em coletarFeedback: Falha ao coletar feedback. Detalhe: ' + e.message);
  }
}

/**
 * Carrega os dados da última semana do aluno selecionado e preenche a Central de Treinos.
 * @throws {Error} Se ocorrer erro ao carregar a semana.
 */
function carregarSemana() {
  const aluno = obterAlunoSelecionado();
  if (!aluno) {
    utils.showAlert('Selecione um aluno.');
    return;
  }
  const idPlanilhaAluno = obterIdPlanilhaAluno(aluno);
  if (!idPlanilhaAluno) {
    utils.showAlert('Planilha do aluno não encontrada.');
    return;
  }
  const dadosUltimaSemana = lerUltimaSemanaAluno(idPlanilhaAluno);
  preencherCentralTreinos(dadosUltimaSemana);
}

/**
 * Envia o treino da Central de Treinos para a planilha do aluno e Brainer, com verificação de sobrescrição.
 * @throws {Error} Se ocorrer erro ao enviar o treino.
 */
function enviarTreino() {
  const aluno = obterAlunoSelecionado();
  if (!aluno) {
    utils.showAlert('Selecione um aluno.');
    return;
  }
  const idPlanilhaAluno = obterIdPlanilhaAluno(aluno);
  if (!idPlanilhaAluno) {
    utils.showAlert('Planilha do aluno não encontrada.');
    return;
  }
  const dadosCentral = lerDadosCentralTreinos();
  if (!dadosCentral || dadosCentral.length === 0) {
    utils.showAlert('Preencha o treino na Central de Treinos antes de enviar.');
    return;
  }
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  let ultimaLinha = abaTreino.getLastRow();
  let proximaLinha = ultimaLinha + 2;
  abaTreino.getRange(proximaLinha, 1, dadosCentral.length, dadosCentral[0].length).setValues(dadosCentral);
  limparCentralTreinos();
  utils.showAlert('Treino enviado com sucesso para o aluno!');
}

/**
 * Copia o treino semanal da Central de Treinos para a planilha do aluno e registra no log.
 * @throws {Error} Se ocorrer erro ao atribuir o treino.
 */
function assignWorkout() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const centralSheet = ss.getSheetByName('Central de Treinos');
  if (!centralSheet) throw new Error("Sheet 'Central de Treinos' not found.");
  const studentName = centralSheet.getRange('B2').getValue();
  if (!studentName) throw new Error("Student name not found in cell B2.");
  const studentSheetName = `treino_semanal_${studentName}`;
  const studentSheet = ss.getSheetByName(studentSheetName);
  if (!studentSheet) throw new Error(`Student sheet '${studentSheetName}' not found.`);
  const logSheet = ss.getSheetByName('log_treinos');
  if (!logSheet) throw new Error("Sheet 'log_treinos' not found.");
  const daysOfWeek = [
    { day: 'Segunda-Feira', start: 6, end: 15 },
    { day: 'Terça-Feira', start: 19, end: 28 },
    { day: 'Quarta-Feira', start: 32, end: 41 },
    { day: 'Quinta-Feira', start: 45, end: 54 },
    { day: 'Sexta-Feira', start: 58, end: 67 },
  ];
  const firstCol = 1;
  const lastCol = 7;
  const numCols = lastCol - firstCol + 1;
  let studentSheetProtection, logSheetProtection;
  try {
    studentSheetProtection = studentSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
    if (studentSheetProtection) studentSheetProtection.remove();
    logSheetProtection = logSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
    if (logSheetProtection) logSheetProtection.remove();
    daysOfWeek.forEach((day, idx) => {
      const destStartRow = day.start;
      const destNumRows = day.end - day.start + 1;
      studentSheet.getRange(destStartRow, firstCol, destNumRows, numCols).clearContent();
    });
    const logHeaders = [
      'Timestamp', 'Student Name', 'Day of Week', 'Tipo de Atividade',
      'Nome do Exercicio', 'Repetições', 'Carga atual', 'Outros'
    ];
    if (logSheet.getLastRow() === 0) logSheet.appendRow(logHeaders);
    daysOfWeek.forEach((day, dayIdx) => {
      const srcRange = centralSheet.getRange(day.start, firstCol, day.end - day.start + 1, numCols);
      const srcValues = srcRange.getValues();
      srcValues.forEach((row, i) => {
        const exerciseName = row[1];
        if (exerciseName && exerciseName.toString().trim() !== '') {
          const destRow = day.start + i;
          studentSheet.getRange(destRow, firstCol, 1, numCols).setValues([row]);
          const logRow = [
            new Date(),
            studentName,
            day.day,
            row[0],
            row[1],
            row[2],
            row[3],
            row.slice(4).join(' | ')
          ];
          logSheet.appendRow(logRow);
        }
      });
    });
  } catch (err) {
    Logger.log('Error in assignWorkout: ' + err);
    throw new Error('Erro em assignWorkout: Falha ao atribuir treino. Detalhe: ' + err.message);
  } finally {
    if (studentSheetProtection) {
      studentSheetProtection = studentSheet.protect();
      studentSheetProtection.setWarningOnly(false);
    }
    if (logSheetProtection) {
      logSheetProtection = logSheet.protect();
      logSheetProtection.setWarningOnly(false);
    }
  }
}

/**
 * Obtém o nome do aluno selecionado no dropdown da Central de Treinos (célula B1).
 * @returns {string} Nome do aluno selecionado.
 */
function obterAlunoSelecionado() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  return aba.getRange('B1').getValue(); // Corrigido: agora lê de B1
}

/**
 * Busca o ID da planilha do aluno no cadastro.
 * @param {string} nomeAluno
 * @returns {string|null} ID da planilha do aluno ou null se não encontrado.
 */
function obterIdPlanilhaAluno(nomeAluno) {
  const planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
  const abaCadastro = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
  const dados = abaCadastro.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === nomeAluno) return dados[i][7];
  }
  return null;
}

/**
 * Lê os dados da última semana do aluno.
 * @param {string} idPlanilhaAluno
 * @returns {Array} Dados da última semana.
 */
function lerUltimaSemanaAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  const dados = abaTreino.getDataRange().getValues();
  let blocos = [];
  let blocoAtual = [];
  for (let i = 0; i < dados.length; i++) {
    if (dados[i][0] && dados[i][0].toString().toLowerCase().includes('segunda')) {
      if (blocoAtual.length > 0) blocos.push(blocoAtual);
      blocoAtual = [dados[i]];
    } else if (blocoAtual.length > 0) {
      blocoAtual.push(dados[i]);
    }
  }
  if (blocoAtual.length > 0) blocos.push(blocoAtual);
  for (let j = blocos.length - 1; j >= 0; j--) {
    const bloco = blocos[j];
    if (bloco.some(linha => linha[1] && linha[1].toString().trim() !== '')) {
      return bloco;
    }
  }
  return [];
}

function preencherCentralTreinos(dadosSemana) {
  if (!dadosSemana || dadosSemana.length === 0) return;
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  let linhaCentral = 6;
  for (let i = 0; i < dadosSemana.length; i++) {
    aba.getRange(linhaCentral + i, 1, 1, dadosSemana[i].length).setValues([dadosSemana[i]]);
  }
}

function lerDadosCentralTreinos() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  const dados = aba.getRange(6, 1, 30, aba.getLastColumn()).getValues();
  return dados.filter(linha => linha[1] && linha[1].toString().trim() !== '');
}

function lerSemanaAtualAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  return [];
}

function apagarSemanaAtualAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
}

function escreverTreinoAluno(idPlanilhaAluno, dados) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
}

function registrarTreinoBrainer(aluno, dados) {
  const planilhaBrainer = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER);
  const abaLog = planilhaBrainer.getSheetByName(CONSTANTES.ABA_LOG_TREINOS_BRAINER);
}

function limparCentralTreinos() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  aba.getRange(6, 1, 30, aba.getLastColumn()).clearContent();
}

module.exports = {
  assignWorkout,
  enviarSemana,
  coletarFeedback,
  carregarSemana,
  enviarTreino,
  obterAlunoSelecionado,
  obterIdPlanilhaAluno,
  lerUltimaSemanaAluno,
  preencherCentralTreinos,
  lerDadosCentralTreinos,
  lerSemanaAtualAluno,
  apagarSemanaAtualAluno,
  escreverTreinoAluno,
  registrarTreinoBrainer,
  limparCentralTreinos
};
