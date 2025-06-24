// =============================
// SCRIPT DE MIGRAÇÃO E SETUP
// =============================

/**
 * Execute esta função UMA VEZ após fazer o deploy para configurar o sistema.
 * Esta função inicializa todas as configurações necessárias.
 */
function configurarSistemaInicial() {
  try {
    Logger.log('🚀 Iniciando configuração do sistema...');
    
    // 1. Inicializar contador de alunos
    inicializarContadorDeAlunos();
    Logger.log('✅ Contador de alunos inicializado');
    
    // 2. Verificar se todas as planilhas são acessíveis
    verificarConexoesPlanilhas();
    Logger.log('✅ Conexões com planilhas verificadas');
    
    // 3. Configurar triggers (se necessário)
    configurarTriggers();
    Logger.log('✅ Triggers configurados');
    
    Logger.log('🎉 Sistema configurado com sucesso!');
    SpreadsheetApp.getUi().alert(
      'Sistema Configurado!', 
      'O sistema Personal Trainer foi configurado com sucesso.\n\nVocê pode agora usar o menu "🔥 Personal Trainer" para gerenciar treinos e alunos.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (e) {
    Logger.log('❌ Erro na configuração: ' + e.message);
    SpreadsheetApp.getUi().alert(
      'Erro na Configuração',
      'Ocorreu um erro durante a configuração:\n\n' + e.message + '\n\nVerifique os IDs das planilhas em constants.js',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Verifica se todas as planilhas configuradas são acessíveis.
 */
function verificarConexoesPlanilhas() {
  var erros = [];
  
  try {
    SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    Logger.log('✓ Planilha Mãe acessível');
  } catch (e) {
    erros.push('Planilha Mãe (ID: ' + CONSTANTES.ID_PLANILHA_MAE + ')');
  }
  
  try {
    SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER);
    Logger.log('✓ Planilha Brainer acessível');
  } catch (e) {
    erros.push('Planilha Brainer (ID: ' + CONSTANTES.ID_PLANILHA_BRAINER + ')');
  }
  
  try {
    DriveApp.getFileById(CONSTANTES.ID_TEMPLATE_ALUNO);
    Logger.log('✓ Template de Aluno acessível');
  } catch (e) {
    erros.push('Template de Aluno (ID: ' + CONSTANTES.ID_TEMPLATE_ALUNO + ')');
  }
  
  try {
    DriveApp.getFolderById(CONSTANTES.ID_PASTA_ALUNOS_ATIVOS);
    Logger.log('✓ Pasta de Alunos Ativos acessível');
  } catch (e) {
    erros.push('Pasta de Alunos Ativos (ID: ' + CONSTANTES.ID_PASTA_ALUNOS_ATIVOS + ')');
  }
  
  if (erros.length > 0) {
    throw new Error('As seguintes planilhas/pastas não são acessíveis:\n' + erros.join('\n'));
  }
}

/**
 * Configura triggers necessários para o sistema.
 */
function configurarTriggers() {
  // Remove triggers existentes para evitar duplicação
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onOpen') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Configura trigger de onOpen
  ScriptApp.newTrigger('onOpen')
    .timeBased()
    .everyDays(1) // Dummy trigger, o onOpen real é automático
    .create();
  
  Logger.log('✓ Triggers configurados');
}
