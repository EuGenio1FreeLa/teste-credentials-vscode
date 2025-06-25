# 🔥 Sistema de Personal Trainer - Google Apps Script

Sistema completo e unificado para gestão de treinos de personal trainer usando Google Sheets e Apps Script.

## 🚀 Funcionalidades

- **📤 Envio de Treinos**: Sistema unificado para enviar treinos semanais
- **📥 Coleta de Feedback**: Coleta feedback dos treinos realizados pelos alunos
- **🔄 Carregar Último Treino**: Carrega treinos anteriores do histórico
- **➡️ Cadastro de Alunos**: Interface HTML para cadastrar novos alunos
- **🔍 Diagnóstico**: Verificação automática da configuração do sistema
- **🧹 Limpeza**: Ferramentas para manter o sistema organizado

## 📁 Estrutura do Projeto

```
src/
├── main.js                 # Menu principal e funções de entrada
├── setup.js               # Configuração inicial do sistema
├── appsscript.json        # Configurações do Apps Script
├── core/
│   ├── constants.js       # Constantes globais do sistema
│   ├── utils.js          # Funções utilitárias
│   ├── alunos.js         # Gestão de alunos
│   └── treinos.js        # Gestão de treinos
└── ui/
    └── cadastrarAluno.html # Interface de cadastro

tests/
├── alunos.test.js         # Testes para módulo de alunos
└── treinos.test.js        # Testes para módulo de treinos

docs/
├── INSTRUCOES_APPS_SCRIPT.md
├── INSTRUCOES_DEPLOY.md
└── CORRECOES_ENVIO_TREINO.md
```

## 🛠️ Configuração

### 1. IDs das Planilhas
Configure os IDs corretos no arquivo `src/core/constants.js`:

```javascript
var CONSTANTES = {
  ID_PLANILHA_MAE: 'SEU_ID_PLANILHA_PRINCIPAL',
  ID_PLANILHA_BRAINER: 'SEU_ID_PLANILHA_BRAINER',
  ID_TEMPLATE_ALUNO: 'SEU_ID_TEMPLATE_ALUNO',
  // ... outras configurações
};
```

### 2. Estrutura das Planilhas
O sistema espera as seguintes abas:

**Planilha Principal:**
- `Alunos_cadastro` - Lista de alunos
- `Central de Treinos` - Interface para montar treinos
- `Exercicios` - Base de exercícios
- `Logsacoes` - Log de ações do sistema

**Planilha Brainer:**
- `log_treinos` - Histórico completo de treinos
- `log_questionarios` - Questionários (futuro)

## 🚀 Deploy no Google Apps Script

### 1. Criar Projeto Google Apps Script
1. Acesse [script.google.com](https://script.google.com)
2. Clique em "Novo projeto"
3. Renomeie para "Personal Trainer System"

### 2. Upload dos Arquivos (usando clasp)
```bash
# Instalar clasp
npm install -g @google/clasp

# Login no Google
clasp login

# Criar projeto
clasp create --type sheets --title "Personal Trainer System"

# Push dos arquivos
clasp push
```

### 3. Configuração Inicial
1. Execute a função `configurarSistemaInicial()` UMA VEZ
2. Execute `testarSistema()` para verificar se tudo funciona
3. Atualize a planilha para ver o menu "🔥 Personal Trainer"

## 💻 Desenvolvimento Local

### Instalação
```bash
npm install
```

### Testes
```bash
npm test
```

### Deploy
```bash
clasp push
```

## 📋 Menu Principal

- **➡️ Cadastrar Novo Aluno**: Interface HTML para cadastro
- **📤 Enviar Treino Semanal**: Envia treino da Central para o aluno
- **📥 Coletar Feedback**: Coleta respostas dos alunos
- **🔄 Carregar Último Treino**: Carrega treino anterior na Central
- **🧹 Limpar Central de Treinos**: Limpa área de trabalho

## 🤝 Contribuindo
Open issues or submit pull requests for improvements.

---