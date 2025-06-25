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
  
  // Planilha "Central de Treinos" → Colunas A…S (novo mapeamento apenas para colunas)
  COL_ID_REGISTRO: 1,           // A
  COL_ID_TREINO_SESSAO: 2,      // B
  COL_ID_ALUNO: 3,              // C
  COL_NOME_ALUNO: 4,            // D
  COL_DATA_EVENTO: 5,           // E
  COL_TIPO_REGISTRO: 6,         // F
  COL_DIA_SEMANA: 7,            // G
  COL_OBJETIVO_SESSAO: 8,       // H
  COL_TIPO_ATIVIDADE: 9,        // I
  COL_NOME_EXERCICIO: 10,       // J
  COL_INSTRUCAO_PROGRESSAO: 11, // K
  COL_WARMUP: 12,               // L
  COL_RIR: 13,                  // M
  COL_TECNICA_ULTIMA: 14,       // N
  COL_INTERVALO: 15,            // O
  COL_SERIES_PRESC: 16,         // P
  COL_REPS_PRESC: 17,           // Q
  COL_CARGA_PRESC: 18,          // R
  COL_OBSERVACOES: 19,          // S

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

// Central de Treinos layout mapping
const CENTRAL_MAPPING = {
  // Formato: day_index: { cell_type: cell_reference }
  0: { // Segunda-Feira
    OBJETIVO_DIA: 'B6',
    ATIV_MOB_1: 'C6',
    MOBILIDADE: 'D6',
    INFERIOR: 'E6',
    ATIV_MOB_2: 'F6',
    ATIVACAO: 'G6',
    SUPERIOR: 'H6',
    OBJETIVO_ANTERIOR: 'I6',
    ATIVACOES_REALIZADAS: 'K6',
    TIPO_ATIVIDADE: 'A7',
    WARM_UP: 'C7',
    RIR: 'D7',
    TECNICA_ULTIMA_SERIE: 'E7',
    INTERVALO: 'F7',
    SERIES_PRESCRITAS: 'G7',
    REPETICOES_PRESCRITAS: 'H7',
    CARGA_PRESCRITA: 'J7',
    CARGA_ATUAL: 'K7',
    OBSERVACOES: 'M7',
    EXERCICIOS: 'B8:B18',
    AUMENTAR_CARGA_REP: 'L8:L18'
  },
  1: { // Terça-Feira
    OBJETIVO_DIA: 'B20',
    ATIV_MOB_1: 'C20',
    MOBILIDADE: 'D20',
    INFERIOR: 'E20',
    ATIV_MOB_2: 'F20',
    ATIVACAO: 'G20',
    SUPERIOR: 'H20',
    OBJETIVO_ANTERIOR: 'I20',
    ATIVACOES_REALIZADAS: 'K20',
    TIPO_ATIVIDADE: 'A21',
    WARM_UP: 'C21',
    RIR: 'D21',
    TECNICA_ULTIMA_SERIE: 'E21',
    INTERVALO: 'F21',
    SERIES_PRESCRITAS: 'G21',
    REPETICOES_PRESCRITAS: 'H21',
    CARGA_PRESCRITA: 'J21',
    CARGA_ATUAL: 'K21',
    OBSERVACOES: 'M21',
    EXERCICIOS: 'B22:B32',
    AUMENTAR_CARGA_REP: 'L22:L32'
  },
  2: { // Quarta-Feira
    OBJETIVO_DIA: 'B34',
    ATIV_MOB_1: 'C34',
    MOBILIDADE: 'D34',
    INFERIOR: 'E34',
    ATIV_MOB_2: 'F34',
    ATIVACAO: 'G34',
    SUPERIOR: 'H34',
    OBJETIVO_ANTERIOR: 'I34',
    ATIVACOES_REALIZADAS: 'K34',
    TIPO_ATIVIDADE: 'A35',
    WARM_UP: 'C35',
    RIR: 'D35',
    TECNICA_ULTIMA_SERIE: 'E35',
    INTERVALO: 'F35',
    SERIES_PRESCRITAS: 'G35',
    REPETICOES_PRESCRITAS: 'H35',
    CARGA_PRESCRITA: 'J35',
    CARGA_ATUAL: 'K35',
    OBSERVACOES: 'M35',
    EXERCICIOS: 'B36:B46',
    AUMENTAR_CARGA_REP: 'L36:L46'
  },
  3: { // Quinta-Feira
    OBJETIVO_DIA: 'B48',
    ATIV_MOB_1: 'C48',
    MOBILIDADE: 'D48',
    INFERIOR: 'E48',
    ATIV_MOB_2: 'F48',
    ATIVACAO: 'G48',
    SUPERIOR: 'H48',
    OBJETIVO_ANTERIOR: 'I48',
    ATIVACOES_REALIZADAS: 'K48',
    TIPO_ATIVIDADE: 'A49',
    WARM_UP: 'C49',
    RIR: 'D49',
    TECNICA_ULTIMA_SERIE: 'E49',
    INTERVALO: 'F49',
    SERIES_PRESCRITAS: 'G49',
    REPETICOES_PRESCRITAS: 'H49',
    CARGA_PRESCRITA: 'J49',
    CARGA_ATUAL: 'K49',
    OBSERVACOES: 'M49',
    EXERCICIOS: 'B50:B60',
    AUMENTAR_CARGA_REP: 'L50:L60'
  },
  4: { // Sexta-Feira
    OBJETIVO_DIA: 'B62',
    ATIV_MOB_1: 'C62',
    MOBILIDADE: 'D62',
    INFERIOR: 'E62',
    ATIV_MOB_2: 'F62',
    ATIVACAO: 'G62',
    SUPERIOR: 'H62',
    OBJETIVO_ANTERIOR: 'I62',
    ATIVACOES_REALIZADAS: 'K62',
    TIPO_ATIVIDADE: 'A63',
    WARM_UP: 'C63',
    RIR: 'D63',
    TECNICA_ULTIMA_SERIE: 'E63',
    INTERVALO: 'F63',
    SERIES_PRESCRITAS: 'G63',
    REPETICOES_PRESCRITAS: 'H63',
    CARGA_PRESCRITA: 'J63',
    CARGA_ATUAL: 'K63',
    OBSERVACOES: 'M63',
    EXERCICIOS: 'B64:B74',
    AUMENTAR_CARGA_REP: 'L64:L74'
  },
  5: { // Sábado
    OBJETIVO_DIA: 'B76',
    ATIV_MOB_1: 'C76',
    MOBILIDADE: 'D76',
    INFERIOR: 'E76',
    ATIV_MOB_2: 'F76',
    ATIVACAO: 'G76',
    SUPERIOR: 'H76',
    OBJETIVO_ANTERIOR: 'I76',
    ATIVACOES_REALIZADAS: 'K76',
    TIPO_ATIVIDADE: 'A77',
    WARM_UP: 'C77',
    RIR: 'D77',
    TECNICA_ULTIMA_SERIE: 'E77',
    INTERVALO: 'F77',
    SERIES_PRESCRITAS: 'G77',
    REPETICOES_PRESCRITAS: 'H77',
    CARGA_PRESCRITA: 'J77',
    CARGA_ATUAL: 'K77',
    OBSERVACOES: 'M77',
    EXERCICIOS: 'B78:B88',
    AUMENTAR_CARGA_REP: 'L78:L88'
  },
  6: { // Domingo
    OBJETIVO_DIA: 'B90',
    ATIV_MOB_1: 'C90',
    MOBILIDADE: 'D90',
    INFERIOR: 'E90',
    ATIV_MOB_2: 'F90',
    ATIVACAO: 'G90',
    SUPERIOR: 'H90',
    OBJETIVO_ANTERIOR: 'I90',
    ATIVACOES_REALIZADAS: 'K90',
    TIPO_ATIVIDADE: 'A91',
    WARM_UP: 'C91',
    RIR: 'D91',
    TECNICA_ULTIMA_SERIE: 'E91',
    INTERVALO: 'F91',
    SERIES_PRESCRITAS: 'G91',
    REPETICOES_PRESCRITAS: 'H91',
    CARGA_PRESCRITA: 'J91',
    CARGA_ATUAL: 'K91',
    OBSERVACOES: 'M91',
    EXERCICIOS: 'B92:B102',
    AUMENTAR_CARGA_REP: 'L92:L102'
  }
};
