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

    // Menu unificado apenas com as funções administrativas principais
    ui.createMenu('🔥 Personal Trainer')
      .addItem('➡️ Cadastrar Novo Aluno', 'abrirFormularioCadastro')
      .addItem('📤 Enviar Treino Semanal', 'sendWeeklyWorkout')
      .addItem('📋 Importar Treinos para Weekly', 'menuImportarCentralParaWeekly')
      .addItem('🧹 Limpar Central de Treinos', 'showLimparCentralTreinosDialog')
      .addToUi();

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
 * Mostra o diálogo para cadastro de um novo aluno
 */
function showCadastrarAlunoDialog() {
  abrirFormularioCadastro();
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
 * Limpa todos os dados da Central de Treinos, preservando dados do aluno e data
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
    // Limpar apenas os dados dos exercícios, preservando cabeçalhos e dados do aluno/data
    // Supondo que os dados de treino começam na linha 5 (ajuste se necessário)
    var linhaInicio = CONSTANTES.LINHA_INICIO_TREINO_CENTRAL || 5;
    var ultimaLinha = aba.getLastRow();
    var ultimaColuna = aba.getLastColumn();

    if (ultimaLinha >= linhaInicio) {
      aba.getRange(linhaInicio, 1, ultimaLinha - linhaInicio + 1, ultimaColuna).clearContent();
    }
    Logger.log('Central de Treinos limpa com sucesso');
  } catch (e) {
    Logger.log('Erro ao limpar Central de Treinos: ' + e.toString());
    SpreadsheetApp.getUi().alert('Erro ao limpar Central de Treinos: ' + e.toString());
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

/**
 * Força o recarregamento dos menus (use esta função se os menus não aparecerem)
 */
function forcarRecarregamentoMenu() {
  try {
    SpreadsheetApp.getUi().alert('Recarregando Menus', 'Os menus serão recarregados agora. Aguarde alguns segundos...', SpreadsheetApp.getUi().ButtonSet.OK);
    
    // Forçar recriação dos menus
    onOpen();
    
    SpreadsheetApp.getUi().alert('Sucesso', 'Menus recarregados! Você deve ver agora:\n\n🔥 Personal Trainer\nFunções Personalizadas\n⚙️ Admin (submenu)', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (e) {
    Logger.log('Erro ao recarregar menu: ' + e.message);
    SpreadsheetApp.getUi().alert('Erro', 'Erro ao recarregar menu: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Configuração inicial completa do sistema incluindo menus
 */
function configurarSistemaCompleto() {
  try {
    SpreadsheetApp.getUi().alert('Configuração', 'Configurando sistema completo...', SpreadsheetApp.getUi().ButtonSet.OK);
    
    // 1. Configurar sistema inicial
    configurarSistemaInicial();
    
    // 2. Forçar carregamento dos menus
    onOpen();
    
    // 3. Validar sistema
    validarSistemaUnificado();
    
  } catch (e) {
    Logger.log('Erro na configuração completa: ' + e.message);
    SpreadsheetApp.getUi().alert('Erro', 'Erro na configuração: ' + e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Mostra o diálogo para cadastro de um novo aluno (compatibilidade)
 */
function showCadastrarAlunoDialog() {
  abrirFormularioCadastro();
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

/**
 * INSTRUÇÕES PARA RESTAURAR MENUS
 * Execute esta função para obter instruções detalhadas
 */
function comoRestaurarMenus() {
  var ui = SpreadsheetApp.getUi();
  
  var instrucoes = 
    "=== COMO RESTAURAR SEUS MENUS ===\n\n" +
    "📋 PASSO A PASSO:\n\n" +
    "1️⃣ Feche e reabra a planilha completamente\n" +
    "2️⃣ Execute: ⚙️ Admin → 🔄 Forçar Recarregar Menus\n" +
    "3️⃣ Execute: ⚙️ Admin → 🚀 Configurar Sistema Completo\n\n" +
    "🎯 MENUS QUE DEVEM APARECER:\n\n" +
    "• 🔥 Personal Trainer:\n" +
    "  - ➡️ Cadastrar Novo Aluno\n" +
    "  - 📤 Enviar Treino Semanal\n" +
    "  - 📥 Coletar Feedback\n" +
    "  - 🔄 Carregar Último Treino\n" +
    "  - 🧹 Limpar Central de Treinos\n\n" +
    "• Funções Personalizadas:\n" +
    "  - Cadastrar Novo Aluno\n" +
    "  - Enviar Treino Semanal\n" +
    "  - Coletar Feedback\n" +
    "  - Limpar Central de Treinos\n\n" +
    "• ⚙️ Admin (submenu):\n" +
    "  - 🚀 Configurar Sistema Completo\n" +
    "  - 🔄 Forçar Recarregar Menus\n" +
    "  - ✅ Validar Sistema Unificado\n" +
    "  - 🧪 Testar Sistema\n" +
    "  - 🔍 Diagnóstico de Treinos\n" +
    "  - 📊 Informações do Sistema\n" +
    "  - 🧹 Limpar Sistema (CUIDADO!)\n\n" +
    "❗ Se ainda não funcionar:\n" +
    "1. Vá no Apps Script (Extensions → Apps Script)\n" +
    "2. Execute manualmente: forcarRecarregamentoMenu()\n" +
    "3. Volte para a planilha";
  
  ui.alert("Instruções para Restaurar Menus", instrucoes, ui.ButtonSet.OK);
  Logger.log(instrucoes);
}
