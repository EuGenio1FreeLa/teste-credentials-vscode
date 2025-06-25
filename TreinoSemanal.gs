/**
 * Importar Central Para Weekly
 * 
 * Esta função percorre cada bloco diário na aba Central de Treinos,
 * lê sessão e séries de exercícios, monta objetos no formato FIELDS
 * e depois grava todos registros na aba treino_semanal, limpando o bloco anterior.
 * 
 * @param {string} idPlanilhaAluno - ID da planilha do aluno
 * @return {object} Objeto com status da operação e mensagem
 */
function importarCentralParaWeekly(idPlanilhaAluno) {
  try {
    Logger.log("Iniciando importação de Central para Weekly");
    
    // 1. Abrir a planilha-mãe e a planilha-aluno
    const ssMaster = SpreadsheetApp.openById(IDS.MASTER);
    const sheetCentral = ssMaster.getSheetByName(SHEETS.CENTRAL);
    
    // Verificar se foi fornecido um ID de planilha de aluno
    if (!idPlanilhaAluno) {
      // Tentar obter a planilha do aluno selecionado na célula B1
      const alunoSelecionado = sheetCentral.getRange("B1").getValue();
      if (!alunoSelecionado) {
        throw new Error("Nenhum aluno selecionado e nenhum ID de planilha fornecido");
      }
      
      // Encontrar o ID da planilha do aluno selecionado
      const sheetAlunosCadastro = ssMaster.getSheetByName(SHEETS.ALUNOS_CADASTRO);
      const alunosData = sheetAlunosCadastro.getRange(CONSTANTES.MAE_LISTA_ALUNOS_CADASTRO).getValues();
      
      for (let i = 0; i < alunosData.length; i++) {
        if (alunosData[i][CONSTANTES.COL_NOME_ALUNO_CADASTRO] === alunoSelecionado) {
          idPlanilhaAluno = alunosData[i][CONSTANTES.COL_ID_PLANILHA_ALUNO_CADASTRO];
          break;
        }
      }
      
      if (!idPlanilhaAluno) {
        throw new Error(`Não foi possível encontrar a planilha para o aluno: ${alunoSelecionado}`);
      }
    }
    
    // Abrir a planilha do aluno
    const ssAluno = SpreadsheetApp.openById(idPlanilhaAluno);
    const sheetWeekly = ssAluno.getSheetByName(SHEETS.WEEKLY);
    
    if (!sheetWeekly) {
      throw new Error(`Aba ${SHEETS.WEEKLY} não encontrada na planilha do aluno`);
    }
    
    // Obter informações do aluno
    const nomeAluno = sheetCentral.getRange("B1").getValue();
    const dataEvento = sheetCentral.getRange("B2").getValue();
    
    // 2. Obter referência de ID de exercícios (para lookup nome -> ID)
    const sheetExercicios = ssMaster.getSheetByName("Exercicios");
    const exerciciosData = sheetExercicios.getRange("C2:D").getValues();
    
    // Criar mapa de nome -> ID de exercício
    const exerciciosMap = {};
    for (let i = 0; i < exerciciosData.length; i++) {
      if (exerciciosData[i][0]) {  // Se tem nome de exercício
        exerciciosMap[exerciciosData[i][0]] = exerciciosData[i][1];  // Nome -> ID
      }
    }
    
    // 3. Percorrer os dias da semana e coletar registros
    let registros = [];
    const days = CONFIG.DAYS;
    
    // Gerar um ID único para a sessão de treino (mesmo para todos os exercícios)
    const idTreinoSessao = Utilities.getUuid();
    
    // Loop pelos dias da semana
    days.forEach((dia, dayIndex) => {
      Logger.log(`Processando dia: ${dia} (índice ${dayIndex})`);
      
      // Referência do mapeamento para o dia atual
      const dayMapping = CENTRAL_MAPPING[dayIndex];
      
      // Ler valores de sessão para o dia
      const objetivoDoDia = sheetCentral.getRange(dayMapping.OBJETIVO_DIA).getValue();
      const ativMob1 = sheetCentral.getRange(dayMapping.ATIV_MOB_1).getValue();
      const mobilidade = sheetCentral.getRange(dayMapping.MOBILIDADE).getValue();
      const inferior = sheetCentral.getRange(dayMapping.INFERIOR).getValue();
      const ativMob2 = sheetCentral.getRange(dayMapping.ATIV_MOB_2).getValue();
      const ativacao = sheetCentral.getRange(dayMapping.ATIVACAO).getValue();
      const superior = sheetCentral.getRange(dayMapping.SUPERIOR).getValue();
      const objetivoAnterior = sheetCentral.getRange(dayMapping.OBJETIVO_ANTERIOR).getValue();
      const ativRealizadas = sheetCentral.getRange(dayMapping.ATIVACOES_REALIZADAS).getValue();
      
      // Ler valores gerais da linha de exercício
      const tipoAtividade = sheetCentral.getRange(dayMapping.TIPO_ATIVIDADE).getValue();
      const warmup = sheetCentral.getRange(dayMapping.WARM_UP).getValue();
      const rir = sheetCentral.getRange(dayMapping.RIR).getValue();
      const tecnica = sheetCentral.getRange(dayMapping.TECNICA_ULTIMA_SERIE).getValue();
      const intervalo = sheetCentral.getRange(dayMapping.INTERVALO).getValue();
      const series = sheetCentral.getRange(dayMapping.SERIES_PRESCRITAS).getValue();
      const repsPrev = sheetCentral.getRange(dayMapping.REPETICOES_PRESCRITAS).getValue();
      const cargaPrev = sheetCentral.getRange(dayMapping.CARGA_PRESCRITA).getValue();
      const cargaAtual = sheetCentral.getRange(dayMapping.CARGA_ATUAL).getValue();
      const obs = sheetCentral.getRange(dayMapping.OBSERVACOES).getValue();
      
      // Extrair o range dos exercícios e instruções de progressão
      const exerciciosRange = dayMapping.EXERCICIOS.split(":");
      const aumentarRange = dayMapping.AUMENTAR_CARGA_REP.split(":");
      
      // Determinar a linha inicial e final
      const startRow = parseInt(exerciciosRange[0].substring(1), 10);
      const endRow = parseInt(exerciciosRange[1].substring(1), 10);
      
      // Para cada linha de exercício no bloco
      for (let row = startRow; row <= endRow; row++) {
        const nomeExercicio = sheetCentral.getRange(`B${row}`).getValue();
        
        // Pula linhas em branco
        if (!nomeExercicio) continue;
        
        // Obter o valor da instrução de progressão (aumentar carga/rep)
        const aumentarCargaRep = sheetCentral.getRange(`L${row}`).getValue();
        
        // Calcular a ordem do exercício (índice dentro do dia)
        const ordemExercicio = row - startRow + 1;
        
        // Buscar o ID do exercício no mapa
        const idExercicio = exerciciosMap[nomeExercicio] || "";
        
        // 5. Montar objeto seguindo a ordem de FIELDS
        const registro = {
          'ID_Registro_Unico': Utilities.getUuid(),
          'ID_Treino_Sessao': idTreinoSessao,
          'ID_Aluno': "", // Pode ser preenchido se disponível
          'Nome_Aluno': nomeAluno,
          'Data_Evento': dataEvento,
          'Tipo_Registro': 'TREINO_SEMANAL',
          'Dia_Semana': dia,
          'objetivo_sessao': objetivoDoDia,
          'Ordem_Exercicio': ordemExercicio,
          'Tipo_Atividade': tipoAtividade,
          'ID_Exercicio': idExercicio,
          'Nome_Exercicio': nomeExercicio,
          'Instrucao_Progressao': aumentarCargaRep,
          'Warm_up': warmup,
          'RiR': rir,
          'Tecnica_para_Ultima_Serie': tecnica,
          'Intervalo': intervalo,
          'Series_Prescritas': series,
          'Repeticoes_prescrita': repsPrev,
          'Carga_prescrita': cargaPrev,
          'Observacoes_personal': obs,
          'Feedback_aluno': "",
          'Repeticoes_realizada': "",
          'Carga_realizada': "",
          'Warm_up_realizado': "",
          'RiR_realizado': "",
          'Tecnica_para_Ultima_Serie_realizado': "",
          'Intervalo_realizado': ""
        };
        
        registros.push(registro);
        Logger.log(`Registro para ${dia}, exercício ${nomeExercicio} adicionado`);
      }
    });
    
    // 4. Converter objetos em matriz e gravar
    // Extrair headers em ordem
    const headers = FIELDS;
    
    // Criar matriz [ [val1, val2, …], … ]
    const valores = registros.map(reg =>
      headers.map(col => reg[col] !== undefined ? reg[col] : '')
    );
    
    Logger.log(`Total de registros a gravar: ${valores.length}`);
    
    // Limpar o bloco antigo e escrever novo
    if (valores.length > 0) {
      // ---- Gravar na planilha do aluno ----
      // Limpar dados antigos
      sheetWeekly
        .getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, 
                 CONSTANTES.NUM_LINHAS_TREINO_ALUNO, headers.length)
        .clearContent();
      
      // Escrever novos dados
      sheetWeekly
        .getRange(CONSTANTES.LINHA_INICIO_TREINO_ALUNO, 1, 
                 valores.length, headers.length)
        .setValues(valores);
      
      // ---- Gravar na planilha Brainer (log) ----
      try {
        const ssBrainer = SpreadsheetApp.openById(IDS.BRAINER);
        const sheetLogBrainer = ssBrainer.getSheetByName(SHEETS.LOG);
        
        if (sheetLogBrainer) {
          // Obter a última linha com conteúdo na planilha Brainer
          const lastRow = sheetLogBrainer.getLastRow();
          
          // Gravar registros na próxima linha vazia
          if (lastRow > 0) {
            sheetLogBrainer.getRange(lastRow + 1, 1, valores.length, valores[0].length)
              .setValues(valores);
            Logger.log(`Registros gravados com sucesso na planilha Brainer`);
          } else {
            // Se a planilha estiver vazia, começar na linha 1
            sheetLogBrainer.getRange(1, 1, valores.length, valores[0].length)
              .setValues(valores);
            Logger.log(`Registros gravados com sucesso na planilha Brainer (planilha vazia)`);
          }
        } else {
          Logger.log(`AVISO: Aba ${SHEETS.LOG} não encontrada na planilha Brainer`);
        }
      } catch (brainerError) {
        // Registrar o erro, mas não falhar a função principal
        Logger.log(`Erro ao gravar na planilha Brainer: ${brainerError.message}`);
        Logger.log(`Stack: ${brainerError.stack}`);
      }
      
      Logger.log("Importação concluída com sucesso!");
      return { success: true, message: `${valores.length} registros importados com sucesso.` };
    } else {
      Logger.log("Nenhum registro para importar");
      return { success: false, message: "Nenhum registro para importar." };
    }
    
  } catch (error) {
    Logger.log(`Erro na importação: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return { success: false, message: `Erro na importação: ${error.message}` };
  }
}

/**
 * Função auxiliar para ser usada via menu
 * Importa dados da Central de Treinos para o aluno selecionado
 */
function menuImportarCentralParaWeekly() {
  const result = importarCentralParaWeekly();
  
  if (result.success) {
    SpreadsheetApp.getUi().alert("Sucesso", result.message, SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert("Erro", result.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
