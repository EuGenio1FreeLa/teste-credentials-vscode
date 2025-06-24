// =================================================================
// MÓDULO DE GERENCIAMENTO DE ALUNOS (VERSÃO FINAL COM PASTAS E INTERVALOS NOMEADOS)
// =================================================================

/**
 * Processa os dados recebidos do formulário HTML para cadastrar um novo aluno.
 * @param {object} formData O objeto com os dados do aluno vindos do formulário.
 * @returns {string} Uma mensagem de sucesso.
 */
function processarFormularioDeCadastro(formData) {
  try {
    // Validação dos campos obrigatórios
    const camposObrigatorios = [
      { campo: 'nomeCompleto', label: 'Nome Completo' },
      { campo: 'email', label: 'E-mail' },
      { campo: 'whatsapp', label: 'Whatsapp' },
      { campo: 'dataInicio', label: 'Data de Início' },
      { campo: 'objetivo', label: 'Objetivo' }
    ];
    const camposVazios = camposObrigatorios.filter(c => !formData[c.campo] || !formData[c.campo].toString().trim());
    if (camposVazios.length > 0) {
      throw new Error('Os seguintes campos são obrigatórios e não foram preenchidos: ' +
        camposVazios.map(c => c.label).join(', '));
    }

    const planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    const abaAlunos = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);

    // 1. Gerar novo ID único
    const novoId = gerarProximoIdAluno_();

    // 2. Criar cópia da planilha modelo na pasta correta
    const template = DriveApp.getFileById(CONSTANTES.ID_TEMPLATE_ALUNO);
    const pastaDestino = DriveApp.getFolderById(CONSTANTES.ID_PASTA_ALUNOS_ATIVOS);
    const novaPlanilha = template.makeCopy(`[${formData.nomeCompleto}] - Plano de Treino`, pastaDestino);

    // 3. Compartilhar com o aluno como editor
    novaPlanilha.addEditor(formData.email);
    const urlNovaPlanilha = novaPlanilha.getUrl();

    // 4. Proteger a planilha recém-criada (agora usando intervalos nomeados)
    protegerPlanilhaAluno_(novaPlanilha.getId());

    // 5. Preparar a nova linha para ser inserida na planilha.
    const dataInicio = new Date(formData.dataInicio + 'T12:00:00');
    const dataVencimento = new Date(dataInicio);
    dataVencimento.setDate(dataVencimento.getDate() + 30);

    const novaLinha = [
      novoId,                                 // 1. ID_aluno
      formData.nomeCompleto,                  // 2. Nome Completo
      formData.email,                         // 3. E-mail
      formData.whatsapp,                      // 4. Whatsapp
      dataInicio,                             // 5. Data_Início
      'Ativo',                                // 6. Status
      formData.objetivo,                      // 7. Objetivo
      novaPlanilha.getId(),                   // 8. ID_Planilha_Aluno
      dataVencimento,                         // 9. Data_Vencimento (30 dias após início)
      formData.observacoes                    // 10. Observações
    ];

    // 6. Adicionar a nova linha ao final da aba de cadastro
    abaAlunos.appendRow(novaLinha);

    // 7. Retornar mensagem de sucesso
    return `Aluno ${formData.nomeCompleto} cadastrado com sucesso!`;

  } catch (e) {
    Logger.log(e);
    throw new Error('Ocorreu um erro no servidor. Detalhes: ' + e.message);
  }
}

/**
 * Aplica proteção na planilha do aluno, deixando apenas os intervalos nomeados de feedback editáveis.
 * @param {string} idPlanilha A ID da planilha do aluno a ser protegida.
 * @private
 */
function protegerPlanilhaAluno_(idPlanilha) {
  const planilhaAluno = SpreadsheetApp.openById(idPlanilha);
  
  // --- Proteção da Aba de Treino Semanal ---
  const abaTreino = planilhaAluno.getSheetByName(CONSTANTES.ABA_TREINO_SEMANAL_ALUNO);
  if (abaTreino) {
    const protection = abaTreino.protect().setDescription('Estrutura do Treino');
    protection.removeEditors(protection.getEditors());
    protection.addEditor(Session.getEffectiveUser());
    
    // Encontra todos os intervalos nomeados que começam com "feedback_"
    const todosIntervalosNomeados = planilhaAluno.getNamedRanges();
    const rangesEditaveis = [];
    for (const intervalo of todosIntervalosNomeados) {
      if (intervalo.getName().toLowerCase().startsWith('feedback_')) {
        rangesEditaveis.push(intervalo.getRange());
      }
    }
    
    // Libera a edição para esses intervalos, se algum for encontrado
    if (rangesEditaveis.length > 0) {
      protection.setUnprotectedRanges(rangesEditaveis);
    }
  }

  // --- Proteção total de outras abas ---
  const abasParaProtegerTotalmente = [
    CONSTANTES.ABA_HISTORICO_ALUNO,
    CONSTANTES.ABA_DADOS_ALUNO,
    CONSTANTES.ABA_AUX_ALUNO
  ];

  abasParaProtegerTotalmente.forEach(nomeAba => {
    const aba = planilhaAluno.getSheetByName(nomeAba);
    if (aba) {
      const protection = aba.protect().setDescription('Aba protegida');
      protection.removeEditors(protection.getEditors());
      protection.addEditor(Session.getEffectiveUser());
    }
  });
}

/**
 * Função auxiliar para gerar um ID de aluno sequencial e único.
 * Utiliza o PropertiesService para armazenar o último ID de forma segura.
 * @private
 */
function gerarProximoIdAluno_() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); 

  try {
    let ultimoId = parseInt(scriptProperties.getProperty('ULTIMO_ID_ALUNO') || '0');
    ultimoId++;
    scriptProperties.setProperty('ULTIMO_ID_ALUNO', ultimoId.toString());
    
    const idFormatado = 'AL' + ultimoId.toString().padStart(3, '0');
    return idFormatado;
  } finally {
    lock.releaseLock();
  }
}

/**
 * (Opcional) Verifica se o acesso do aluno está vencido e bloqueia a edição se necessário.
 * @param {string} idPlanilhaAluno
 * @param {Date} dataVencimento
 * @private
 */
function verificarAcessoPorVencimento_(idPlanilhaAluno, dataVencimento) {
  const hoje = new Date();
  if (hoje > dataVencimento) {
    const planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
    planilhaAluno.getSheets().forEach(sheet => {
      const protection = sheet.protect().setDescription('Acesso vencido');
      protection.removeEditors(protection.getEditors());
      protection.addEditor(Session.getEffectiveUser());
    });
  }
}

/**
 * Inicializa o contador de IDs de alunos, caso ainda não exista.
 */
function inicializarContadorDeAlunos() {
  const scriptProperties = PropertiesService.getScriptProperties();
  if (!scriptProperties.getProperty('ULTIMO_ID_ALUNO')) {
    scriptProperties.setProperty('ULTIMO_ID_ALUNO', '0');
  }
}