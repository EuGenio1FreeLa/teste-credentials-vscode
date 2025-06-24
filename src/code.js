/**
 * @OnlyCurrentDoc
 */

// =================================================================
// ARQUIVO DE CONFIGURAÇÃO PRINCIPAL E MENU
// =================================================================

// --- CONSTANTES GLOBAIS DO SISTEMA ---
const CONSTANTES = {
  // === IDs DE ARQUIVOS E PASTAS ===
  // Planilhas
  ID_PLANILHA_MAE:     '1-lc_s1n8m7cNOkCEmtmpqXm09t10aDdF31KvZsxDUtA',
  ID_PLANILHA_BRAINER: '1hIbdufl-CrfiNHkBYpByPQDLyhJWY9bTITmJ2utH2Kg',
  ID_TEMPLATE_ALUNO:   '1g-aZtaAXTtRhPSz0EoRCJagkg5i5nLbNuYEzo4WVC8o',

  // Pastas no Google Drive
  ID_PASTA_ALUNOS_ATIVOS:    '1Uu5N9tfv6tYm3xWT7MMaY2qGlbfEUass',
  ID_PASTA_RELATORIOS_PDF:   '1_LtlJOK86bbmImgA334RbqOWhN1xQJYt',

  // === NOMES DAS ABAS NA PLANILHA MÃE ===
  ABA_ALUNOS_CADASTRO:   'Alunos_cadastro',
  ABA_EXERCICIOS:        'Exercicios',
  ABA_BD_ATIVACAO:       'BD_Ativacao',
  ABA_CENTRAL_TREINOS:   'Central de Treinos',
  ABA_PAGAMENTOS:        'Pagamentos',
  ABA_LOG_ACOES:         'Logsacoes',

  // === NOMES DAS ABAS NA PLANILHA BRAINER ===
  ABA_LOG_TREINOS_BRAINER:       'log_treinos',
  ABA_LOG_QUESTIONARIOS_BRAINER: 'log_questionarios',

  // === NOMES DAS ABAS NA PLANILHA ALUNO (TEMPLATE E CÓPIAS) ===
  ABA_TREINO_SEMANAL_ALUNO: 'treino_semanal',
  ABA_HISTORICO_ALUNO:      'historico_local',
  ABA_DADOS_ALUNO:          'dados_aluno',
  ABA_AUX_ALUNO:            'Aux',

  // =================================================================
  // === INTERVALOS NOMEADOS ===
  // =================================================================

  // --- Intervalos na Planilha Mãe ---
  MAE_BANCO_ATIVACAO:                   'BancoAtivacao',
  MAE_ESCALA_RPE:                       'EscalaRPE',
  MAE_LISTA_ALUNOS_CADASTRO:            'ListaAlunosCadastro',
  MAE_LISTA_CONJUNTOS_EXERCICIO:        'ListaConjuntosExercicio',
  MAE_LISTA_EXERCICIOS_COM_GRUPO:       'ListaExerciciosCOMgrupo',
  MAE_LISTA_EXERCICIOS_RAW_S_GRUPO:     'ListaExerciciosRAWsgrupo',
  MAE_LISTA_ID_ATIV:                    'ListaIDAtiv',
  MAE_LISTA_ID_EXERCICIOS:              'ListaIDExercicios',
  MAE_LISTA_LOGS_ACOES:                 'ListaLogsAcoes',
  MAE_LISTA_PAGAMENTOS:                 'ListaPagamentos',
  MAE_LISTA_REGIOES_ATIV:               'ListaRegioesAtiv',
  MAE_LISTA_REGIOES_EXERCICIOS_ATIVADAS:'ListaRegioesExerciciosAtivadas',
  MAE_LISTA_STATUS_ALUNOS:              'ListaStatusAlunos',
  MAE_LISTA_STATUS_PAGTO:               'ListaStatusPagto',
  MAE_LISTA_TIPOS_ATIV:                 'ListaTiposAtiv',
  MAE_TIPOS_PAGAMENTO:                  'TiposPagamento',

  // --- Intervalos no Template do Aluno (e suas cópias) ---
  ALUNO_ESCALA_DE_RPE:                'EscaladeRPE',
  ALUNO_RNG_ID_UNICO_TREINO:          'rng_id_unico_treino',
  ALUNO_RNG_TREINO_ID_EXERCICIO:      'rng_TreinoIDExercicio',
  ALUNO_RNG_TREINO_SEMANAL_DADOS:     'rng_TreinoSemanalDados'
};
// ------------------------------------------

/**
 * Função que é executada quando a planilha é aberta.
 * Cria o menu personalizado do sistema.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('🔥 Personal Trainer')
    .addItem('➡️ Cadastrar Novo Aluno', 'abrirFormularioCadastro')
    .addSeparator()
    .addItem('📥 Coletar Feedback da Semana', 'coletarFeedback') // Assumindo que esta função existe em outro módulo
    .addToUi();
}

/**
 * Abre o formulário de cadastro de aluno em uma janela modal.
 */
function abrirFormularioCadastro() {
  const html = HtmlService.createHtmlOutputFromFile('cadastrarAluno')
      .setWidth(450)
      .setHeight(580);
  SpreadsheetApp.getUi().showModalDialog(html, 'Formulário de Cadastro');
}