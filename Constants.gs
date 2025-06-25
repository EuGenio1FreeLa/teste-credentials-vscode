// =============================
// CONSTANTES GLOBAIS DO SISTEMA
// =============================

var CONSTANTES = {
  // === IDs DE ARQUIVOS E PASTAS ===
  ID_PLANILHA_MAE:     '1-lc_s1n8m7cNOkCEmtmpqXm09t10aDdF31KvZsxDUtA',
  ID_PLANILHA_BRAINER: '1hIbdufl-CrfiNHkBYpByPQDLyhJWY9bTITmJ2utH2Kg',
  ID_TEMPLATE_ALUNO:   '1g-aZtaAXTtRhPSz0EoRCJagkg5i5nLbNuYEzo4WVC8o',
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

  // === INTERVALOS NOMEADOS ===
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
  ALUNO_RNG_TREINO_SEMANAL_DADOS:     'rng_TreinoSemanalDados',
  // --- Intervalos na Planilha Brainer ---
  BRAINER_LOG_TREINOS:                'LogTreinos',
  BRAINER_LOG_QUESTIONARIOS:          'LogQuestionarios',

  // === MAPEAMENTO DE COLUNAS ===
  // Central de Treinos
  COL_DIA_SEMANA_CENTRAL: 0,
  COL_TIPO_ATIVIDADE_CENTRAL: 1,
  COL_NOME_EXERCICIO_CENTRAL: 2,
  COL_REPETICOES_CENTRAL: 3,
  COL_CARGA_CENTRAL: 4,
  COL_OUTROS_INICIO_CENTRAL: 5,

  // Planilha do Aluno
  COL_ID_REGISTRO_UNICO: 0,
  COL_ID_TREINO_SESSAO: 1,
  COL_TIPO_REGISTRO: 2,
  COL_NOME_EXERCICIO_ALUNO: 3,
  
  // Cadastro de Alunos
  COL_ID_ALUNO_CADASTRO: 0,
  COL_NOME_ALUNO_CADASTRO: 1,
  COL_EMAIL_ALUNO_CADASTRO: 2,
  COL_WHATSAPP_ALUNO_CADASTRO: 3,
  COL_DATA_INICIO_CADASTRO: 4,
  COL_STATUS_ALUNO_CADASTRO: 5,
  COL_OBJETIVO_ALUNO_CADASTRO: 6,
  COL_ID_PLANILHA_ALUNO_CADASTRO: 7,
  COL_DATA_VENCIMENTO_CADASTRO: 8,
  COL_OBSERVACOES_ALUNO_CADASTRO: 9,

  // Planilha Brainer
  COL_NOME_ALUNO_BRAINER: 1,
  COL_TIPO_ATIVIDADE_BRAINER: 3,
  COL_NOME_EXERCICIO_BRAINER: 4,
  COL_REPETICOES_BRAINER: 5,
  COL_CARGA_BRAINER: 6,
  COL_ID_TREINO_SESSAO_BRAINER: 7,
  COL_TIMESTAMP_BRAINER: 0,

  // === CONFIGURAÇÕES DE INTERVALOS ===
  CELULA_DROPDOWN_ALUNO: 'B2',
  LINHA_INICIO_TREINO_CENTRAL: 5,
  NUM_LINHAS_TREINO_CENTRAL: 20,
  LINHA_INICIO_TREINO_ALUNO: 3,
  NUM_LINHAS_TREINO_ALUNO: 30,
    // Colunas de feedback e realizado
  COLUNAS_REALIZADO_FEEDBACK: [8, 9, 10, 11, 12] // índices das colunas de feedback
};

// =============================
// CONSTANTS FOR TREINO SEMANAL IMPLEMENTATION
// =============================

// Centralized field definitions for treino_semanal
const FIELDS = [
  'ID_Registro_Unico',
  'ID_Treino_Sessao', 
  'ID_Aluno',
  'Nome_Aluno',
  'Data_Evento',
  'Tipo_Registro',
  'Dia_Semana',
  'objetivo_sessao',
  'Ordem_Exercicio',
  'Tipo_Atividade',
  'ID_Exercicio',
  'Nome_Exercicio',
  'Instrucao_Progressao',
  'Warm_up',
  'RiR',
  'Tecnica_para_Ultima_Serie',
  'Intervalo',
  'Series_Prescritas',
  'Repeticoes_prescrita',
  'Carga_prescrita',
  'Observacoes_personal',
  'Feedback_aluno',
  'Repeticoes_realizada',
  'Carga_realizada',
  'Warm_up_realizado',
  'RiR_realizado',
  'Tecnica_para_Ultima_Serie_realizado',
  'Intervalo_realizado'
];

// Sheet names
const SHEETS = {
  CENTRAL: 'Central de Treinos',
  WEEKLY: 'treino_semanal',
  CONFIG: 'config',
  ALUNOS_CADASTRO: 'Alunos_cadastro',
  LOG: 'log_treinos'
};

// Spreadsheet IDs
const IDS = {
  BRAINER: CONSTANTES.ID_PLANILHA_BRAINER,
  MASTER: CONSTANTES.ID_PLANILHA_MAE
};

// Configuration constants
const CONFIG = {
  BLOCK_HEIGHT: 14,
  EXERCISE_ROWS: 11,
  DAYS: ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo']
};
