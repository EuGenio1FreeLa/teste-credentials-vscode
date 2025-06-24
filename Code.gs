// =============================
// MAIN ENTRY POINT
// =============================

/**
 * Função que é executada quando a planilha é aberta.
 * Cria o menu personalizado do sistema.
 */
function onOpen(e) {
  var menu = SpreadsheetApp.getUi()
    .createMenu('🔥 Personal Trainer')
    .addItem('➡️ Cadastrar Novo Aluno', 'abrirFormularioCadastro')
    .addSeparator()
    .addItem('📤 Enviar Treino Semanal', 'enviarTreinoSemanal')
    .addItem('📥 Coletar Feedback da Semana', 'coletarFeedback')
    .addItem('🔄 Carregar Último Treino', 'carregarUltimoTreinoAluno')
    .addSeparator()
    .addItem('🧹 Limpar Central de Treinos', 'limparCentralTreinos');
    
  // Submenu de administração
  var menuAdmin = SpreadsheetApp.getUi()
    .createMenu('⚙️ Admin')
    .addItem('🚀 Configurar Sistema Inicial', 'configurarSistemaInicial')
    .addItem('🧪 Testar Sistema', 'testarSistema')
    .addItem('📊 Informações do Sistema', 'exibirInformacoesSistema')
    .addSeparator()
    .addItem('🧹 Limpar Sistema (CUIDADO!)', 'limparSistema');
    
  menu.addSubMenu(menuAdmin)
      .addToUi();
}

/**
 * Abre o formulário de cadastro de aluno.
 */
function abrirFormularioCadastro() {
  var html = HtmlService.createHtmlOutputFromFile('CadastrarAluno')
      .setWidth(450)
      .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Formulário de Cadastro');
}

/**
 * Função que executa quando o webapp é acessado
 */
function doGet(e) {
  if (e.parameter.page === 'feedback') {
    return HtmlService.createHtmlOutputFromFile('FeedbackForm')
      .setTitle('Feedback de Treino');
  }
  
  return HtmlService.createHtmlOutputFromFile('Error')
    .setTitle('Página não encontrada');
}

/**
 * Processa o feedback do aluno via formulário web
 */
function processarFeedback(formData) {
  try {
    logInfo('Processando feedback de treino', formData);
    return registrarFeedbackTreino(formData.idAluno, formData.idTreino, formData);
  } catch (error) {
    logError('Erro ao processar feedback', error);
    return { success: false, message: error.message };
  }
}

/**
 * Testa todo o sistema para verificar se está funcionando adequadamente
 */
function testarSistema() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    // Mostrar que teste está começando
    ui.alert('Teste do Sistema', 'Iniciando testes do sistema...', ui.ButtonSet.OK);
    
    // 1. Testar conexão com planilhas
    verificarConexoesPlanilhas();
    
    // 2. Verificar configuração de contador de alunos
    var scriptProperties = PropertiesService.getScriptProperties();
    var ultimoId = scriptProperties.getProperty('ULTIMO_ID_ALUNO');
    if (!ultimoId) {
      inicializarContadorDeAlunos();
      ultimoId = scriptProperties.getProperty('ULTIMO_ID_ALUNO');
    }
    
    // 3. Verificar menu e triggers
    var triggers = ScriptApp.getProjectTriggers();
    var temOnOpen = triggers.some(function(trigger) {
      return trigger.getHandlerFunction() === 'onOpen';
    });
    
    if (!temOnOpen) {
      configurarTriggers();
    }
    
    // Mostrar resultados
    ui.alert(
      'Testes Concluídos', 
      'Sistema testado com sucesso!\n\n' +
      '✅ Conexão com planilhas: OK\n' +
      '✅ Contador de alunos: ' + ultimoId + '\n' +
      '✅ Triggers: ' + (temOnOpen ? 'OK' : 'Configurados agora') + '\n',
      ui.ButtonSet.OK
    );
    
  } catch (e) {
    ui.alert('Erro nos Testes', 'Ocorreu um erro durante os testes: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Exibe informações do sistema (versão, contador de alunos, etc)
 */
function exibirInformacoesSistema() {
  var ui = SpreadsheetApp.getUi();
  
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var ultimoId = scriptProperties.getProperty('ULTIMO_ID_ALUNO') || 'Não inicializado';
    
    var numAlunos = 0;
    try {
      var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
      var abaCadastro = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
      numAlunos = abaCadastro.getLastRow() - 1; // -1 para o cabeçalho
    } catch (e) {
      numAlunos = 'Erro ao contar';
    }
    
    ui.alert(
      'Informações do Sistema', 
      'Sistema Personal Trainer\n\n' +
      'Versão: 1.0.0\n' +
      'Último ID de Aluno: ' + ultimoId + '\n' +
      'Número de Alunos: ' + numAlunos + '\n' +
      'Data: ' + new Date().toLocaleDateString() + '\n',
      ui.ButtonSet.OK
    );
    
  } catch (e) {
    ui.alert('Erro', 'Ocorreu um erro ao exibir informações: ' + e.message, ui.ButtonSet.OK);
  }
}

/**
 * Limpa configurações do sistema (PERIGO!)
 */
function limparSistema() {
  var ui = SpreadsheetApp.getUi();
  
  var resposta = ui.alert(
    'ATENÇÃO! Operação Perigosa', 
    'Esta operação irá limpar todas as configurações do sistema, incluindo o contador de alunos.\n\n' +
    'Isso NÃO apagará os alunos nem os dados existentes, mas pode causar problemas ao cadastrar novos alunos.\n\n' +
    'Tem certeza que deseja continuar?',
    ui.ButtonSet.YES_NO
  );
  
  if (resposta !== ui.Button.YES) {
    ui.alert('Operação Cancelada', 'Nenhuma alteração foi feita.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    // Limpar propriedades
    PropertiesService.getScriptProperties().deleteProperty('ULTIMO_ID_ALUNO');
    
    // Remover triggers
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(trigger) {
      ScriptApp.deleteTrigger(trigger);
    });
    
    ui.alert(
      'Sistema Limpo!', 
      'Todas as configurações do sistema foram removidas.\n\n' +
      'Execute "Configurar Sistema Inicial" para configurar novamente.',
      ui.ButtonSet.OK
    );
    
  } catch (e) {
    ui.alert('Erro', 'Ocorreu um erro ao limpar o sistema: ' + e.message, ui.ButtonSet.OK);
  }
}
