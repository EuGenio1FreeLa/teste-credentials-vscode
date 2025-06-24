// =============================
// MAIN ENTRY POINT (was code.js)
// =============================
const treinos = require('./core/treinos');
const alunos = require('./core/alunos');
const CONSTANTES = require('./core/constants');

/**
 * Função que é executada quando a planilha é aberta.
 * Cria o menu personalizado do sistema.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('🔥 Personal Trainer')
    .addItem('➡️ Cadastrar Novo Aluno', 'abrirFormularioCadastro')
    .addSeparator()
    .addItem('📥 Coletar Feedback da Semana', 'coletarFeedback')
    .addToUi();
}

global.onOpen = onOpen;

global.abrirFormularioCadastro = function() {
  const html = HtmlService.createHtmlOutputFromFile('ui/cadastrarAluno')
      .setWidth(450)
      .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Formulário de Cadastro');
};

global.coletarFeedback = treinos.coletarFeedback;
// Add other global Apps Script entry points as needed
