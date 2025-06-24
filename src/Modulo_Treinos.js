// =================================================================
// MÓDULO DE LÓGICA DE TREINOS
// =================================================================

/**
 * Envia o treino montado na Central de Treinos para a planilha do aluno e para o Brainer.
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
    ui.alert('Ocorreu um erro ao enviar o treino:', e.message);
  }
}

/**
 * Coleta o feedback preenchido pelo aluno e atualiza o Brainer.
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
    ui.alert('Ocorreu um erro ao coletar o feedback:', e.message);
  }
}


/**
 * Carrega os dados da última semana do aluno selecionado e preenche a Central de Treinos.
 */
function carregarSemana() {
  const aluno = obterAlunoSelecionado();
  if (!aluno) {
    SpreadsheetApp.getUi().alert('Selecione um aluno.');
    return;
  }
  const idPlanilhaAluno = obterIdPlanilhaAluno(aluno);
  if (!idPlanilhaAluno) {
    SpreadsheetApp.getUi().alert('Planilha do aluno não encontrada.');
    return;
  }
  const dadosUltimaSemana = lerUltimaSemanaAluno(idPlanilhaAluno);
  preencherCentralTreinos(dadosUltimaSemana);
}

/**
 * Envia o treino da Central de Treinos para a planilha do aluno e Brainer, com verificação de sobrescrição.
 */
function enviarTreino() {
  const aluno = obterAlunoSelecionado();
  if (!aluno) {
    SpreadsheetApp.getUi().alert('Selecione um aluno.');
    return;
  }
  const idPlanilhaAluno = obterIdPlanilhaAluno(aluno);
  if (!idPlanilhaAluno) {
    SpreadsheetApp.getUi().alert('Planilha do aluno não encontrada.');
    return;
  }
  const dadosCentral = lerDadosCentralTreinos();
  const dadosExistentes = lerSemanaAtualAluno(idPlanilhaAluno);

  if (dadosExistentes && dadosExistentes.length > 0) {
    const resposta = SpreadsheetApp.getUi().prompt(
      'Já existem dados preenchidos pelo aluno nesta semana. O que deseja fazer?',
      'Digite: MANTER para manter, APAGAR para sobrescrever, CANCELAR para cancelar.',
      SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
    );
    if (resposta.getSelectedButton() !== SpreadsheetApp.getUi().Button.OK) return;
    const acao = resposta.getResponseText().toUpperCase();
    if (acao === 'CANCELAR') return;
    if (acao === 'APAGAR') apagarSemanaAtualAluno(idPlanilhaAluno);
    // Se for manter, não faz nada, apenas adiciona novos registros.
  }

  escreverTreinoAluno(idPlanilhaAluno, dadosCentral);
  registrarTreinoBrainer(aluno, dadosCentral);
  SpreadsheetApp.getUi().alert('Treino enviado com sucesso!');
}

/**
 * Utilitários e funções auxiliares
 */

// Obtém o nome do aluno selecionado no dropdown
function obterAlunoSelecionado() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  return aba.getRange('B2').getValue(); // Ajuste conforme a célula do dropdown
}

// Busca o ID da planilha do aluno no cadastro
function obterIdPlanilhaAluno(nomeAluno) {
  const planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
  const abaCadastro = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
  const dados = abaCadastro.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === nomeAluno) return dados[i][3]; // Ajuste o índice conforme a coluna do ID/URL
  }
  return null;
}

// Lê os dados da última semana do aluno
function lerUltimaSemanaAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  // Supondo que cada semana é um bloco, pegue o último bloco preenchido
  const dados = abaTreino.getDataRange().getValues();
  // Implemente a lógica para identificar a última semana
  return dados; // Ajuste para retornar apenas a última semana
}

// Preenche a Central de Treinos com os dados lidos
function preencherCentralTreinos(dadosSemana) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  // Implemente a lógica para preencher as células corretas
}

// Lê os dados preenchidos na Central de Treinos
function lerDadosCentralTreinos() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  // Implemente a lógica para ler os dados dos exercícios da semana
  return []; // Array de objetos/linhas
}

// Lê os dados da semana atual na planilha do aluno
function lerSemanaAtualAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  // Implemente a lógica para identificar a semana vigente
  return []; // Array de objetos/linhas
}

// Apaga os dados da semana atual na planilha do aluno
function apagarSemanaAtualAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  // Implemente a lógica para apagar os dados da semana vigente
}

// Escreve os dados do treino na planilha do aluno
function escreverTreinoAluno(idPlanilhaAluno, dados) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  // Implemente a lógica para inserir os dados
}

// Registra o treino também na planilha Brainer
function registrarTreinoBrainer(aluno, dados) {
  const planilhaBrainer = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER);
  const abaLog = planilhaBrainer.getSheetByName(CONSTANTES.ABA_LOG_TREINOS_BRAINER);
  // Implemente a lógica para registrar o envio
}