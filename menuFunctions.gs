function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Funções Personalizadas')
    .addItem('Enviar Treino Semanal', 'showSendTrainingDialog')
    .addToUi();
}