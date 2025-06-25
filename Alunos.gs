// =============================
// MÓDULO DE GERENCIAMENTO DE ALUNOS
// =============================

/**
 * Processa os dados recebidos do formulário HTML para cadastrar um novo aluno.
 * @param {Object} formData - O objeto com os dados do aluno vindos do formulário.
 * @param {string} formData.nomeCompleto
 * @param {string} formData.email
 * @param {string} formData.whatsapp
 * @param {string} formData.dataInicio
 * @param {string} formData.objetivo
 * @param {string} [formData.observacoes]
 * @returns {string} Uma mensagem de sucesso.
 * @throws {Error} Se algum campo obrigatório estiver faltando ou ocorrer erro no cadastro.
 */
function processarFormularioDeCadastro(formData) {
  try {
    Logger.log('Iniciando cadastro de novo aluno: ' + formData.nomeCompleto);
    
    // Validar campos obrigatórios
    var camposObrigatorios = [
      { campo: 'nomeCompleto', label: 'Nome Completo' },
      { campo: 'email', label: 'E-mail' },
      { campo: 'whatsapp', label: 'Whatsapp' },
      { campo: 'dataInicio', label: 'Data de Início' },
      { campo: 'objetivo', label: 'Objetivo' }
    ];
    var camposVazios = camposObrigatorios.filter(function(c) {
      return !formData[c.campo] || !formData[c.campo].toString().trim();
    });
    if (camposVazios.length > 0) {
      throw new Error('Os seguintes campos são obrigatórios e não foram preenchidos: ' +
        camposVazios.map(function(c) { return c.label; }).join(', '));
    }
    
    // Abrir a planilha mãe e a aba de alunos
    var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    var abaAlunos = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    
    if (!abaAlunos) {
      throw new Error('Aba de cadastro de alunos não encontrada: ' + CONSTANTES.ABA_ALUNOS_CADASTRO);
    }
    
    // Verificar se já existe aluno com o mesmo email
    var dadosAlunos = abaAlunos.getDataRange().getValues();
    var emailNormalizado = formData.email.toString().trim().toLowerCase();
    
    for (var i = 1; i < dadosAlunos.length; i++) {
      var emailExistente = dadosAlunos[i][CONSTANTES.COL_EMAIL_ALUNO_CADASTRO];
      if (emailExistente && emailExistente.toString().trim().toLowerCase() === emailNormalizado) {
        // Se encontrou email igual de um aluno ativo, exibe erro
        var statusAluno = dadosAlunos[i][CONSTANTES.COL_STATUS_ALUNO_CADASTRO];
        if (statusAluno && statusAluno.toString().trim().toLowerCase() === 'ativo') {
          throw new Error('Já existe um aluno ativo cadastrado com este e-mail.');
        }
      }
    }
    
    // Gerar um novo ID para o aluno
    var novoId = gerarProximoIdAluno_();
    Logger.log('Novo ID gerado para o aluno: ' + novoId);
    
    // Criar uma cópia do template para o novo aluno
    var template = DriveApp.getFileById(CONSTANTES.ID_TEMPLATE_ALUNO);
    var pastaDestino = DriveApp.getFolderById(CONSTANTES.ID_PASTA_ALUNOS_ATIVOS);
    
    // Incluir o ID do aluno no nome do arquivo para facilitar a identificação
    var nomeArquivo = '[' + novoId + '] [' + formData.nomeCompleto + '] - Plano de Treino';
    var novaPlanilha = template.makeCopy(nomeArquivo, pastaDestino);
    
    Logger.log('Nova planilha criada: ' + novaPlanilha.getName() + ' | ID: ' + novaPlanilha.getId());
    
    // Adicionar o aluno como editor da planilha
    novaPlanilha.addEditor(formData.email);
    
    // Compartilhar a planilha com o usuário do projeto
    novaPlanilha.addEditor(Session.getEffectiveUser().getEmail());
    
    var urlNovaPlanilha = novaPlanilha.getUrl();
    Logger.log('URL da nova planilha: ' + urlNovaPlanilha);
    
    // Aplicar proteções necessárias na planilha do aluno
    protegerPlanilhaAluno_(novaPlanilha.getId());
    
    // Preparar os dados para o cadastro
    var dataInicio = new Date(formData.dataInicio + 'T12:00:00');
    var dataVencimento = new Date(dataInicio);
    dataVencimento.setDate(dataVencimento.getDate() + 30);
    
    // Obter o ID da planilha criada
    var studentSheetId = novaPlanilha.getId();
    
    // Salvar o ID no ScriptProperties como fallback
    PropertiesService.getScriptProperties().setProperty(
      'student_' + emailNormalizado,
      studentSheetId
    );
    
    // Criar a linha com os dados do aluno para inserir na planilha de cadastro
    var novaLinha = [
      novoId,                 // ID do aluno
      formData.nomeCompleto,  // Nome completo
      formData.email,         // E-mail
      formData.whatsapp,      // WhatsApp
      dataInicio,             // Data de início
      'Ativo',                // Status
      formData.objetivo,      // Objetivo
      studentSheetId,         // ID da planilha do aluno (importante para referência futura)
      dataVencimento,         // Data de vencimento
      formData.observacoes    // Observações
    ];
    
    // Adicionar os dados à planilha de cadastro
    abaAlunos.appendRow(novaLinha);
    Logger.log('Dados do aluno adicionados à planilha de cadastro');
    
    // Salvar também na planilha Brainer para suporte a recuperação
    try {
      var brainerSheet = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_BRAINER).getActiveSheet();
      var headers = brainerSheet.getDataRange().getValues()[0];
      var idCol = headers.indexOf('SpreadsheetID') + 1;
      
      // Se a coluna não existe, adicione-a
      if (idCol === 0) {
        idCol = headers.length + 1;
        brainerSheet.getRange(1, idCol).setValue('SpreadsheetID');
        headers.push('SpreadsheetID');
      }
      
      // Verificar se já existe uma linha para este aluno
      var emailCol = headers.indexOf('Email') + 1;
      var encontrado = false;
      
      if (emailCol > 0) {
        var dadosBrainer = brainerSheet.getDataRange().getValues();
        for (var i = 1; i < dadosBrainer.length; i++) {
          if (dadosBrainer[i][emailCol-1] === emailNormalizado) {
            brainerSheet.getRange(i+1, idCol).setValue(studentSheetId);
            encontrado = true;
            break;
          }
        }
      }
      
      // Se não encontrou o aluno na planilha Brainer, adiciona uma nova linha
      if (!encontrado) {
        var novoBrainer = new Array(headers.length).fill("");
        var emailIdx = headers.indexOf('Email');
        var nomeIdx = headers.indexOf('Nome');
        var idAlunoIdx = headers.indexOf('ID_Aluno');
        var idSheetIdx = headers.indexOf('SpreadsheetID');
        
        if (emailIdx >= 0) novoBrainer[emailIdx] = emailNormalizado;
        if (nomeIdx >= 0) novoBrainer[nomeIdx] = formData.nomeCompleto;
        if (idAlunoIdx >= 0) novoBrainer[idAlunoIdx] = novoId;
        if (idSheetIdx >= 0) novoBrainer[idSheetIdx] = studentSheetId;
        
        brainerSheet.appendRow(novoBrainer);
      }
      
      Logger.log('ID da planilha do aluno salvo na planilha Brainer: ' + studentSheetId);
    } catch (err) {
      Logger.log('Aviso: Não foi possível salvar o ID na planilha Brainer: ' + err.toString());
      // Não interrompemos o processo se esta parte falhar
    }
    
    // Atualizar também a planilha do aluno com alguns dados básicos
    try {
      var planilhaAlunoAberta = SpreadsheetApp.openById(studentSheetId);
      var abaDadosAluno = planilhaAlunoAberta.getSheetByName(CONSTANTES.ABA_DADOS_ALUNO);
      
      if (abaDadosAluno) {
        // Preencher os dados básicos na aba de dados do aluno
        abaDadosAluno.getRange("B2").setValue(novoId);          // ID do aluno
        abaDadosAluno.getRange("B3").setValue(formData.nomeCompleto); // Nome
        abaDadosAluno.getRange("B4").setValue(formData.email);    // E-mail
        abaDadosAluno.getRange("B5").setValue(formData.whatsapp); // WhatsApp
        abaDadosAluno.getRange("B6").setValue(dataInicio);      // Data de início
        abaDadosAluno.getRange("B7").setValue('Ativo');         // Status
        abaDadosAluno.getRange("B8").setValue(formData.objetivo); // Objetivo
        
        Logger.log('Dados do aluno sincronizados com a planilha individual');
      }
    } catch (err) {
      Logger.log('Aviso: Não foi possível atualizar a aba de dados da planilha do aluno: ' + err.toString());
      // Não interrompemos o processo se esta parte falhar
    }
    
    // [NEW] Logging do ID salvo para debug
    Logger.log('Saved SpreadsheetID for ' + emailNormalizado + ': ' + studentSheetId);
    
    return 'Aluno ' + formData.nomeCompleto + ' cadastrado com sucesso!\nID: ' + novoId + '\n\nLink da planilha: ' + urlNovaPlanilha;
  } catch (e) {
    Logger.log('Erro em processarFormularioDeCadastro:', e);
    throw new Error('Falha ao cadastrar aluno. Detalhe: ' + e.message);
  }
}

/**
 * Gera um novo ID para o aluno.
 * A função verifica o maior ID existente na planilha de alunos e gera um novo ID sequencial.
 * O ID é formatado no padrão ALxxxx, onde xxxx é um número sequencial.
 * A função também armazena o último ID gerado nas propriedades do script para referência futura.
 * @returns {string} O novo ID gerado para o aluno.
 * @throws {Error} Se ocorrer erro ao gerar o ID.
 * @private
 */
function gerarProximoIdAluno_() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // Primeiro verificamos o maior ID na planilha para garantir que não haja duplicação
    var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    var abaAlunos = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    var range = abaAlunos.getRange("A:A"); // Coluna dos IDs
    var values = range.getValues();
    
    // Variável para armazenar o maior número encontrado
    var maiorNumero = 0;
    
    // Expressão regular para extrair o número do ID (AL0001 -> 1)
    var regex = /AL0*(\d+)/i;
    
    // Procura pelo maior número nos IDs existentes
    for (var i = 1; i < values.length; i++) { // Começamos de 1 para pular o cabeçalho
      var id = values[i][0];
      if (id && typeof id === 'string') {
        var match = id.toString().match(regex);
        if (match && match[1]) {
          var numero = parseInt(match[1]);
          if (numero > maiorNumero) {
            maiorNumero = numero;
          }
        }
      }
    }
    
    Logger.log('Maior número de ID encontrado na planilha: ' + maiorNumero);
    
    // Agora verificamos o valor armazenado nas propriedades do script
    var ultimoId = parseInt(scriptProperties.getProperty('ULTIMO_ID_ALUNO') || '0');
    Logger.log('Último ID armazenado nas propriedades: ' + ultimoId);
    
    // Usamos o maior valor entre o armazenado e o encontrado na planilha
    ultimoId = Math.max(ultimoId, maiorNumero);
    
    // Incrementamos para o próximo ID
    ultimoId++;
    
    // Atualizamos o valor nas propriedades do script
    scriptProperties.setProperty('ULTIMO_ID_ALUNO', ultimoId.toString());
    
    // Formatamos o ID com o padrão ALxxxx (com zeros à esquerda)
    var idFormatado = 'AL' + ultimoId.toString().padStart(4, '0');
    
    Logger.log('Novo ID gerado: ' + idFormatado);
    return idFormatado;
  } catch (e) {
    Logger.log('Erro em gerarProximoIdAluno_:', e);
    throw new Error('Falha ao gerar novo ID. Detalhe: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Verifica se o acesso do aluno está vencido e bloqueia a edição se necessário.
 * @param {string} idPlanilhaAluno
 * @param {Date} dataVencimento
 * @throws {Error} Se ocorrer erro ao verificar acesso.
 * @private
 */
function verificarAcessoPorVencimento_(idPlanilhaAluno, dataVencimento) {
  try {
    var hoje = new Date();
    if (hoje > dataVencimento) {
      var planilhaAluno = SpreadsheetApp.openById(idPlanilhaAluno);
      planilhaAluno.getSheets().forEach(function(sheet) {
        var protection = sheet.protect().setDescription('Acesso vencido');
        protection.removeEditors(protection.getEditors());
        protection.addEditor(Session.getEffectiveUser());
      });
    }
  } catch (e) {
    Logger.log('Error in verificarAcessoPorVencimento_:', e);
    throw new Error('Erro em verificarAcessoPorVencimento_: Falha ao verificar acesso. Detalhe: ' + e.message);
  }
}

/**
 * Inicializa o contador de IDs de alunos, caso ainda não exista.
 * @throws {Error} Se ocorrer erro ao inicializar o contador.
 */
function inicializarContadorDeAlunos() {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    if (!scriptProperties.getProperty('ULTIMO_ID_ALUNO')) {
      scriptProperties.setProperty('ULTIMO_ID_ALUNO', '0');
    }
  } catch (e) {
    Logger.log('Error in inicializarContadorDeAlunos:', e);
    throw new Error('Erro em inicializarContadorDeAlunos: Falha ao inicializar contador. Detalhe: ' + e.message);
  }
}

/**
 * Obtém informações de um aluno pelo ID
 * @param {string} idAluno - ID do aluno
 * @returns {Object|null} Informações do aluno ou null se não encontrado
 */
function obterInfoAluno(idAluno) {
  try {
    var planilhaMae = SpreadsheetApp.openById(CONSTANTES.ID_PLANILHA_MAE);
    var abaCadastro = planilhaMae.getSheetByName(CONSTANTES.ABA_ALUNOS_CADASTRO);
    
    if (!abaCadastro) {
      logError('Aba de cadastro não encontrada', null, {abaName: CONSTANTES.ABA_ALUNOS_CADASTRO});
      return null;
    }
    
    var dados = abaCadastro.getDataRange().getValues();
    for (var i = 1; i < dados.length; i++) {
      if (dados[i][0] === idAluno) {
        return {
          id: dados[i][0],
          nome: dados[i][1],
          email: dados[i][2],
          whatsapp: dados[i][3],
          dataInicio: dados[i][4],
          status: dados[i][5],
          objetivo: dados[i][6],
          idPlanilha: dados[i][7],
          dataVencimento: dados[i][8]
        };
      }
    }
    
    logInfo('Aluno não encontrado', {idAluno: idAluno});
    return null;
  } catch (e) {
    logError('Erro ao obter informações do aluno', e, {idAluno: idAluno});
    return null;
  }
}
