function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Funções Personalizadas')
    .addItem('Cadastrar Novo Aluno', 'showCadastrarAlunoDialog')
    .addSeparator()
    .addItem('Limpar Central de Treinos', 'showLimparCentralTreinosDialog')
    .addToUi();
}

/**
 * Mostra o diálogo para cadastro de um novo aluno
 */
function showCadastrarAlunoDialog() {
  var ui = SpreadsheetApp.getUi();
  
  // Carrega o HTML da página de cadastro
  var html = HtmlService.createTemplateFromFile('CadastrarAluno')
      .evaluate()
      .setWidth(500)
      .setHeight(600)
      .setTitle('Cadastrar Novo Aluno');
  
  ui.showModalDialog(html, 'Cadastrar Novo Aluno');
}

/**
 * Mostra um diálogo de confirmação antes de limpar a Central de Treinos
 */
function showLimparCentralTreinosDialog() {
  var ui = SpreadsheetApp.getUi();
  var resposta = ui.alert(
    'Limpar Central de Treinos',
    'Tem certeza que deseja limpar todos os dados da Central de Treinos?\n\nEsta ação não pode ser desfeita.',
    ui.ButtonSet.YES_NO
  );
  
  if (resposta === ui.Button.YES) {
    limparCentralTreinos();
    ui.alert('Central de Treinos foi limpa com sucesso!');
  }
}

/**
 * Limpa todos os dados da Central de Treinos
 * Implementação local para garantir acesso às constantes
 */
function limparCentralTreinos() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(CONSTANTES.ABA_CENTRAL_TREINOS);
  
  if (!aba) {
    Logger.log('Aba Central de Treinos não encontrada: ' + CONSTANTES.ABA_CENTRAL_TREINOS);
    SpreadsheetApp.getUi().alert('Erro: Aba Central de Treinos não encontrada!');
    return;
  }
  
  try {
    // Preservar dados do aluno e data na parte superior
    var linhaInicio = CONSTANTES.LINHA_INICIO_TREINO_CENTRAL || 5; // Default para linha 5 se a constante não existir
    var numLinhas = CONSTANTES.NUM_LINHAS_TREINO_CENTRAL || (aba.getLastRow() - linhaInicio + 1); // Default para todas as linhas restantes
    
    // Limpar apenas os dados dos exercícios, preservando cabeçalhos e configurações
    aba.getRange(linhaInicio, 1, numLinhas, aba.getLastColumn()).clearContent();
    Logger.log('Central de Treinos limpa com sucesso');
  } catch (e) {
    Logger.log('Erro ao limpar Central de Treinos: ' + e.toString());
    SpreadsheetApp.getUi().alert('Erro ao limpar Central de Treinos: ' + e.toString());
  }
}