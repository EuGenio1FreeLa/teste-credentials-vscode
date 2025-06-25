# Documentação: Nova Funcionalidade importarCentralParaWeekly

## Visão geral

A função `importarCentralParaWeekly()` foi implementada para melhorar o processo de transferência de dados da aba "Central de Treinos" para a aba "treino_semanal" nas planilhas de alunos. Esta função usa um mapeamento detalhado das células da Central de Treinos para garantir que todos os dados sejam corretamente lidos e escritos no formato adequado do banco de dados do treino semanal.

## Funcionalidades

1. **Mapeamento Completo**: Usa constantes definidas em `CENTRAL_MAPPING` para mapear precisamente cada campo da Central de Treinos
2. **Geração de UUIDs**: Gera identificadores únicos para cada registro e sessão de treino
3. **Integração com Brainer**: Além de gravar na planilha do aluno, também registra os dados na planilha Brainer
4. **Tratamento de Erros**: Reporta erros específicos para facilitar o diagnóstico de problemas
5. **Interface no Menu**: Menu dedicado para acesso à funcionalidade

## Estrutura de Dados

A função mapeia os seguintes campos da Central de Treinos para os campos da aba treino_semanal:

| Central de Treinos | treino_semanal |
|-------------------|----------------|
| Objetivo do Dia | objetivo_sessao |
| Nome do Exercício | Nome_Exercicio |
| Warm-up | Warm_up |
| RiR | RiR |
| Técnica p/ Última Série | Tecnica_para_Ultima_Serie |
| Intervalo | Intervalo |
| Séries Prescritas | Series_Prescritas |
| Repetições Prescritas | Repeticoes_prescrita |
| Carga Prescrita | Carga_prescrita |
| aumentar carga/rep | Instrucao_Progressao |
| Observações | Observacoes_personal |

## Como Usar

### Método 1: Através do menu
1. Abra a planilha-mãe
2. Selecione um aluno no dropdown
3. Clique em "🔥 Personal Trainer" > "📋 Importar Treinos para Weekly"

### Método 2: Envio de treino
1. A função `enviarTreino()` automaticamente usa a nova implementação
2. Abra a planilha-mãe
3. Selecione um aluno no dropdown
4. Clique em "🔥 Personal Trainer" > "📤 Enviar Treino Semanal"

### Método 3: Via código
```javascript
// Para o aluno selecionado na planilha-mãe
importarCentralParaWeekly();

// Para um aluno específico (fornecendo ID)
importarCentralParaWeekly("id_da_planilha_do_aluno");
```

## Implementação Técnica

A implementação segue estas etapas principais:

1. **Identificação do aluno**: Obtém o ID da planilha do aluno selecionado
2. **Abertura das planilhas**: Abre a planilha-mãe e a do aluno
3. **Mapeamento de campos**: Usa CENTRAL_MAPPING para localizar e ler os dados
4. **Geração de registros**: Cria objetos com todos os campos necessários
5. **Conversão para matriz**: Transforma os registros em uma matriz de valores
6. **Gravação**: Escreve os dados nas planilhas do aluno e Brainer

## Manutenção

Se a estrutura da Central de Treinos mudar, é necessário atualizar o objeto `CENTRAL_MAPPING` em `Constants.gs` com os novos mapeamentos de células.
