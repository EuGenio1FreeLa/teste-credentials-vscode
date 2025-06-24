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
 * Carrega os dados da semana anterior (do Brainer) para a Central de Treinos.
 */
function carregarSemanaAnterior() {
    const ui = SpreadsheetApp.getUi();
  try {
    // Esta função será acionada por um botão na Central de Treinos
    
    // 1. Obter o aluno selecionado
    // ...
    
    // 2. Calcular o intervalo de datas da semana anterior
    // ...

    // 3. Buscar no Brainer os registros "Realizados" para o aluno nesse período
    // ...

    // 4. Popular as colunas "...anterior" na Central de Treinos com os dados encontrados
    // ...

    ui.alert('Dados da semana anterior carregados!');
  } catch(e) {
    ui.alert('Ocorreu um erro ao carregar os dados:', e.message);
  }
}