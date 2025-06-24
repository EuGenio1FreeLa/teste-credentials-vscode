function enviarTreinoSemanal() {
  var ui = SpreadsheetApp.getUi();
  var planilhaMae = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = planilhaMae.getActiveSheet();
  
  // Get the selected student name from the dropdown
  var alunoSelecionado = sheet.getRange("B1").getValue();
  if (!alunoSelecionado) {
    ui.alert("Por favor, selecione um aluno!");
    return;
  }
  
  // Get student data from the "Alunos" sheet in the main spreadsheet
  var sheetAlunos = planilhaMae.getSheetByName("Alunos");
  if (!sheetAlunos) {
    ui.alert("Planilha 'Alunos' não encontrada!");
    return;
  }
  
  var dadosAlunos = sheetAlunos.getDataRange().getValues();
  var idPlanilha = null;
  var rowAluno = -1;
  
  // Find the student by name and get their spreadsheet ID
  for (var i = 1; i < dadosAlunos.length; i++) {
    if (dadosAlunos[i][1] == alunoSelecionado) { // Assuming column B (index 1) has the student name
      idPlanilha = dadosAlunos[i][7]; // Assuming column H (index 7) has the ID_Planilha_Aluno
      rowAluno = i;
      break;
    }
  }
  
  if (!idPlanilha) {
    // Try to search in the Google Drive folder as fallback
    try {
      var folder = DriveApp.getFolderById("1Uu5N9tfv6tYm3xWT7MMaY2qGlbfEUass");
      var files = folder.getFilesByName(alunoSelecionado + " - Treino");
      
      if (files.hasNext()) {
        var file = files.next();
        idPlanilha = file.getId();
      } else {
        ui.alert("Planilha do aluno não encontrada! Verifique se o aluno possui uma planilha cadastrada.");
        return;
      }
    } catch (e) {
      ui.alert("Erro ao buscar planilha do aluno: " + e.toString());
      return;
    }
  }
  
  try {
    // Open student spreadsheet
    var planilhaAluno = SpreadsheetApp.openById(idPlanilha);
    if (!planilhaAluno) {
      ui.alert("Planilha do aluno não pôde ser aberta!");
      return;
    }
    
    // Get the weekly training data from main spreadsheet
    var sheetTreino = planilhaMae.getSheetByName("Treinos");
    if (!sheetTreino) {
      ui.alert("Planilha 'Treinos' não encontrada!");
      return;
    }
    
    // Get the training sheet in student's spreadsheet
    var sheetTreinoAluno = planilhaAluno.getSheetByName("Treino Semanal");
    if (!sheetTreinoAluno) {
      ui.alert("Aba 'Treino Semanal' não encontrada na planilha do aluno!");
      return;
    }
    
    // Get training data for the selected student
    var dadosTreino = sheetTreino.getRange("A:Z").getValues(); // Adjust range as needed
    var treinoAluno = [];
    
    // Filter training data for this student or get current week's training
    // Customize this logic according to your specific training data structure
    for (var i = 1; i < dadosTreino.length; i++) {
      if (dadosTreino[i][0] == alunoSelecionado || dadosTreino[i][1] == alunoSelecionado) {
        treinoAluno.push(dadosTreino[i]);
      }
    }
    
    if (treinoAluno.length === 0) {
      ui.alert("Nenhum treino encontrado para este aluno!");
      return;
    }
    
    // Clear previous training data in student's sheet
    sheetTreinoAluno.getRange(2, 1, sheetTreinoAluno.getLastRow(), sheetTreinoAluno.getLastColumn()).clearContent();
    
    // Write new training data
    sheetTreinoAluno.getRange(2, 1, treinoAluno.length, treinoAluno[0].length).setValues(treinoAluno);
    
    // Update last sent date if needed
    if (rowAluno > 0) {
      sheetAlunos.getRange(rowAluno + 1, 9).setValue(new Date()); // Update last sent date in column I
    }
    
    // Success message
    ui.alert("Treino enviado com sucesso para " + alunoSelecionado + "!");
    
  } catch (e) {
    ui.alert("Erro ao processar o envio: " + e.toString());
  }
}

// Add this function to your sidebar or menu to select a student and send training
function showSendTrainingDialog() {
  var ui = SpreadsheetApp.getUi();
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get all students for dropdown
  var sheetAlunos = planilha.getSheetByName("Alunos");
  if (!sheetAlunos) {
    ui.alert("Planilha 'Alunos' não encontrada!");
    return;
  }
  
  var dadosAlunos = sheetAlunos.getRange("B2:B" + sheetAlunos.getLastRow()).getValues();
  var htmlListaAlunos = "";
  
  dadosAlunos.forEach(function(row) {
    if (row[0]) {
      htmlListaAlunos += '<option value="' + row[0] + '">' + row[0] + '</option>';
    }
  });
  
  var htmlOutput = HtmlService.createHtmlOutput(
    '<form id="myForm">' +
    '  <select id="aluno" style="width: 100%; margin-bottom: 10px;">' +
    htmlListaAlunos +
    '  </select>' +
    '  <input type="button" value="Enviar Treino" onclick="submitForm()" style="width: 100%">' +
    '</form>' +
    '<script>' +
    'function submitForm() {' +
    '  var alunoSelecionado = document.getElementById("aluno").value;' +
    '  google.script.run.withSuccessHandler(closeDialog).selecionarEEnviarTreino(alunoSelecionado);' +
    '}' +
    'function closeDialog() {' +
    '  google.script.host.close();' +
    '}' +
    '</script>'
  )
    .setWidth(300)
    .setHeight(150);
  
  ui.showModalDialog(htmlOutput, 'Enviar Treino Semanal');
}

function selecionarEEnviarTreino(alunoSelecionado) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = planilha.getActiveSheet();
  
  // Set the selected student in cell B1 and trigger the send function
  sheet.getRange("B1").setValue(alunoSelecionado);
  enviarTreinoSemanal();
}
