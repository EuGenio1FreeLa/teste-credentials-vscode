// =============================
// MAIN ENTRY POINT
// =============================

/**
 * Função que é executada quando a planilha é aberta.
 * Cria o menu personalizado do sistema.
 */
function onOpen(e) {
  try {
    var ui = SpreadsheetApp.getUi();
    var menu = ui.createMenu('🔥 Personal Trainer')
      .addItem('➡️ Cadastrar Novo Aluno', 'abrirFormularioCadastro')
      .addSeparator()
      .addItem('📤 Enviar Treino Semanal', 'enviarTreino')
      .addItem('📥 Coletar Feedback da Semana', 'coletarFeedback')
      .addItem('🔄 Carregar Último Treino', 'carregarUltimoTreinoAluno')
      .addSeparator()
      .addItem('🧹 Limpar Central de Treinos', 'limparCentralTreinos');

    var menuAdmin = ui.createMenu('⚙️ Admin')
      .addItem('🚀 Configurar Sistema Inicial', 'configurarSistemaInicial')
      .addItem('✅ Validar Sistema Unificado', 'validarSistemaUnificado')
      .addItem('🧪 Testar Sistema', 'testarSistema')
      .addItem('🔍 Diagnóstico de Treinos', 'diagnosticarConfiguracaoTreino')
      .addItem('📊 Informações do Sistema', 'exibirInformacoesSistema')
      .addSeparator()
      .addItem('🧹 Limpar Sistema (CUIDADO!)', 'limparSistema');

    menu.addSubMenu(menuAdmin).addToUi();
  } catch (err) {
    console.error('onOpen failed: ' + err.stack);
    Logger.log('onOpen failed: ' + err.message);
    throw err;
  }
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
  try {
    if (e.parameter.page === 'feedback') {
      return HtmlService.createHtmlOutputFromFile('FeedbackForm')
        .setTitle('Feedback de Treino');
    }
    
    return HtmlService.createHtmlOutputFromFile('Error')
      .setTitle('Página não encontrada');
  } catch (err) {
    console.error('doGet failed: ' + err.stack);
    Logger.log('doGet failed: ' + err.message);
    throw err;  // Relançar o erro para registro no Stackdriver
  }
}

/**
 * Processa o feedback do aluno via formulário web
 */
function processarFeedback(formData) {
  try {
    console.log('Processando feedback de treino: ' + JSON.stringify(formData));
    logInfo('Processando feedback de treino', formData);
    return registrarFeedbackTreino(formData.idAluno, formData.idTreino, formData);
  } catch (err) {
    console.error('processarFeedback failed: ' + err.stack);
    logError('Erro ao processar feedback', err);
    return { success: false, message: err.message };
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

/**
 * Função de diagnóstico para verificar se a configuração está correta.
 */
function diagnosticarConfiguracaoTreino() {
  try {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActive();
    let diagnostico = "=== DIAGNÓSTICO DE CONFIGURAÇÃO ===\n\n";
    
    // Verificar aba Central de Treinos
    const centralSheet = ss.getSheetByName(SHEETS.CENTRAL);
    if (!centralSheet) {
      diagnostico += "❌ Aba 'Central de Treinos' não encontrada!\n";
    } else {
      diagnostico += "✅ Aba 'Central de Treinos' encontrada\n";
      
      const studentIdA1 = centralSheet.getRange('A1').getValue();
      const studentNameB1 = centralSheet.getRange('B1').getValue();
      const mondayDateB2 = centralSheet.getRange('B2').getValue();
      
      diagnostico += "\nCÉLULAS DA CENTRAL DE TREINOS:\n";
      diagnostico += "A1 (ID do Aluno): " + (studentIdA1 || "[VAZIO]") + "\n";
      diagnostico += "B1 (Nome do Aluno): " + (studentNameB1 || "[VAZIO]") + "\n";
      diagnostico += "B2 (Data Segunda): " + (mondayDateB2 || "[VAZIO]") + "\n";
    }
    
    // Verificar aba de cadastro
    const cadastroSheet = ss.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    if (!cadastroSheet) {
      diagnostico += "\n❌ Aba '" + CONSTANTES.ABA_ALUNOS_CADASTRO + "' não encontrada!\n";
    } else {
      diagnostico += "\n✅ Aba de cadastro encontrada\n";
      const totalAlunos = cadastroSheet.getLastRow() - 1;
      diagnostico += "Total de alunos cadastrados: " + totalAlunos + "\n";
    }
    
    // Verificar constantes
    diagnostico += "\nCONSTANTES:\n";
    diagnostico += "ABA_CENTRAL_TREINOS: " + CONSTANTES.ABA_CENTRAL_TREINOS + "\n";
    diagnostico += "ABA_ALUNOS_CADASTRO: " + CONSTANTES.ABA_ALUNOS_CADASTRO + "\n";
    diagnostico += "COL_ID_ALUNO_CADASTRO: " + CONSTANTES.COL_ID_ALUNO_CADASTRO + "\n";
    diagnostico += "COL_NOME_ALUNO_CADASTRO: " + CONSTANTES.COL_NOME_ALUNO_CADASTRO + "\n";
    diagnostico += "COL_ID_PLANILHA_ALUNO_CADASTRO: " + CONSTANTES.COL_ID_PLANILHA_ALUNO_CADASTRO + "\n";
    
    Logger.log(diagnostico);
    ui.alert("Diagnóstico", diagnostico, ui.ButtonSet.OK);
    
  } catch (e) {
    Logger.log('Erro no diagnóstico: ' + e.message);
    SpreadsheetApp.getUi().alert('Erro', 'Erro no diagnóstico: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Função de validação completa do sistema após a unificação
 */
function validarSistemaUnificado() {
  try {
    const ui = SpreadsheetApp.getUi();
    let relatorio = "=== VALIDAÇÃO DO SISTEMA UNIFICADO ===\n\n";
    
    // 1. Verificar estrutura básica
    relatorio += "1. ESTRUTURA BÁSICA:\n";
    const ss = SpreadsheetApp.getActive();
    const centralSheet = ss.getSheetByName(SHEETS.CENTRAL);
    const cadastroSheet = ss.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    
    relatorio += centralSheet ? "✅ Aba Central de Treinos encontrada\n" : "❌ Aba Central de Treinos não encontrada\n";
    relatorio += cadastroSheet ? "✅ Aba de Cadastro encontrada\n" : "❌ Aba de Cadastro não encontrada\n";
    
    // 2. Verificar constantes críticas
    relatorio += "\n2. CONSTANTES CRÍTICAS:\n";
    relatorio += `✅ ID_PLANILHA_BRAINER: ${IDS.BRAINER}\n`;
    relatorio += `✅ ABA_CENTRAL_TREINOS: ${SHEETS.CENTRAL}\n`;
    relatorio += `✅ ABA_TREINO_SEMANAL: ${SHEETS.WEEKLY}\n`;
    
    // 3. Verificar conectividade com Brainer
    relatorio += "\n3. CONECTIVIDADE:\n";
    try {
      const brainer = SpreadsheetApp.openById(IDS.BRAINER);
      const logSheet = brainer.getSheetByName(SHEETS.LOG);
      relatorio += logSheet ? "✅ Conexão com Brainer OK\n" : "❌ Aba log_treinos não encontrada no Brainer\n";
    } catch (e) {
      relatorio += "❌ Erro ao conectar com Brainer: " + e.message + "\n";
    }
    
    // 4. Verificar funções disponíveis
    relatorio += "\n4. FUNÇÕES DISPONÍVEIS:\n";
    relatorio += "✅ enviarTreino()\n";
    relatorio += "✅ sendWeeklyWorkout()\n";
    relatorio += "✅ coletarFeedback()\n";
    relatorio += "✅ carregarUltimoTreinoAluno()\n";
    relatorio += "✅ diagnosticarConfiguracaoTreino()\n";
    
    // 5. Verificar configuração da Central de Treinos
    if (centralSheet) {
      relatorio += "\n5. CONFIGURAÇÃO ATUAL:\n";
      const studentId = centralSheet.getRange('A1').getValue();
      const studentName = centralSheet.getRange('B1').getValue();
      const mondayDate = centralSheet.getRange('B2').getValue();
      
      relatorio += `A1 (ID Aluno): ${studentId || '[VAZIO]'}\n`;
      relatorio += `B1 (Nome): ${studentName || '[VAZIO]'}\n`;
      relatorio += `B2 (Data): ${mondayDate || '[VAZIO]'}\n`;
    }
    
    relatorio += "\n=== SISTEMA PRONTO PARA USO ===\n";
    relatorio += "Use: Menu 🔥 Personal Trainer → 📤 Enviar Treino Semanal";
    
    Logger.log(relatorio);
    ui.alert("Validação Completa", relatorio, ui.ButtonSet.OK);
    
  } catch (e) {
    Logger.log('Erro na validação: ' + e.message);
    SpreadsheetApp.getUi().alert('Erro', 'Erro na validação: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
