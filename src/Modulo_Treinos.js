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
  if (!dadosCentral || dadosCentral.length === 0) {
    SpreadsheetApp.getUi().alert('Preencha o treino na Central de Treinos antes de enviar.');
    return;
  }

  // Abrir planilha do aluno e aba de treino semanal
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);

  // Encontrar a próxima linha disponível (após o último bloco)
  let ultimaLinha = abaTreino.getLastRow();
  let proximaLinha = ultimaLinha + 2; // Espaço de 1 linha entre blocos (ajuste se necessário)

  // Escrever o bloco de treino
  abaTreino.getRange(proximaLinha, 1, dadosCentral.length, dadosCentral[0].length).setValues(dadosCentral);

  limparCentralTreinos();
  SpreadsheetApp.getUi().alert('Treino enviado com sucesso para o aluno!');
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
    if (dados[i][0] === nomeAluno) return dados[i][7]; // Coluna H = índice 7
  }
  return null;
}

// Lê os dados da última semana do aluno
function lerUltimaSemanaAluno(idPlanilhaAluno) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  const dados = abaTreino.getDataRange().getValues();

  // Encontrar blocos de semana: cada "Segunda-Feira" marca o início de uma semana
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

  // Procurar o último bloco com pelo menos um exercício preenchido
  for (let j = blocos.length - 1; j >= 0; j--) {
    const bloco = blocos[j];
    // Verifica se há pelo menos um exercício preenchido (ex: coluna Nome do Exercício não vazia)
    if (bloco.some(linha => linha[1] && linha[1].toString().trim() !== '')) {
      return bloco;
    }
  }
  return [];
}

// Preenche a Central de Treinos com os dados lidas
function preencherCentralTreinos(dadosSemana) {
  if (!dadosSemana || dadosSemana.length === 0) return;
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);

  // Supondo que o layout da Central de Treinos é igual ao da planilha do aluno
  // e começa a preencher a partir da mesma linha/célula
  let linhaCentral = 6; // Exemplo: começa na linha 6 (ajuste conforme seu layout)
  for (let i = 0; i < dadosSemana.length; i++) {
    aba.getRange(linhaCentral + i, 1, 1, dadosSemana[i].length).setValues([dadosSemana[i]]);
  }
}

// Lê os dados preenchidos na Central de Treinos
function lerDadosCentralTreinos() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  // Supondo que o bloco de treino começa na linha 6 e vai até a linha 35 (ajuste conforme seu layout)
  const dados = aba.getRange(6, 1, 30, aba.getLastColumn()).getValues();
  // Filtra linhas que têm pelo menos o nome do exercício preenchido (coluna 2)
  return dados.filter(linha => linha[1] && linha[1].toString().trim() !== '');
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

// Limpa os dados da Central de Treinos
function limparCentralTreinos() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  aba.getRange(6, 1, 30, aba.getLastColumn()).clearContent(); // Ajuste linhas/colunas conforme seu layout
}