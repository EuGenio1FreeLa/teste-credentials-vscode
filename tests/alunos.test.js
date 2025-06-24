const alunos = require('../src/core/alunos');

// Mock Apps Script APIs
global.SpreadsheetApp = {
  openById: jest.fn(() => ({
    getSheetByName: jest.fn(() => {
      const sheetMock = {
        appendRow: jest.fn(),
        getDataRange: jest.fn(() => ({ getValues: jest.fn(() => []) })),
        protect: jest.fn(() => {
          const protectMock = {
            setWarningOnly: jest.fn(),
            setDescription: jest.fn(),
            addEditor: jest.fn(),
            removeEditors: jest.fn(() => protectMock)
          };
          return protectMock;
        })
      };
      return sheetMock;
    })
  }))
};
global.DriveApp = {
  getFileById: jest.fn(() => ({
    makeCopy: jest.fn(() => ({
      addEditor: jest.fn(),
      getUrl: jest.fn(() => 'https://fakeurl'),
      getId: jest.fn(() => 'fakeId')
    }))
  })),
  getFolderById: jest.fn(() => ({}))
};
global.PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn(() => '0'),
    setProperty: jest.fn()
  }))
};
global.LockService = {
  getScriptLock: jest.fn(() => ({
    waitLock: jest.fn(),
    releaseLock: jest.fn()
  }))
};
global.Session = {
  getEffectiveUser: jest.fn(() => ({}))
};
global.Logger = { log: jest.fn() }; // <-- Always mock Logger

describe('processarFormularioDeCadastro', () => {
  it('registers a student with valid data', () => {
    const formData = {
      nomeCompleto: 'Aluno Teste',
      email: 'aluno@teste.com',
      whatsapp: '123456789',
      dataInicio: '2025-06-24',
      objetivo: 'Emagrecer',
      observacoes: 'Nenhuma'
    };
    expect(() => alunos.processarFormularioDeCadastro(formData)).not.toThrow();
  });

  it('throws on missing required fields', () => {
    const formData = {
      nomeCompleto: '',
      email: '',
      whatsapp: '',
      dataInicio: '',
      objetivo: '',
      observacoes: ''
    };
    expect(() => alunos.processarFormularioDeCadastro(formData)).toThrow(/obrigatórios/);
  });

  it('handles edge case: existing ID', () => {
    // Simulate existing ID by setting getProperty to return '42'
    global.PropertiesService.getScriptProperties = jest.fn(() => ({
      getProperty: jest.fn(() => '42'),
      setProperty: jest.fn()
    }));
    const formData = {
      nomeCompleto: 'Aluno Existente',
      email: 'existente@teste.com',
      whatsapp: '999999999',
      dataInicio: '2025-06-24',
      objetivo: 'Manter',
      observacoes: 'Já existe'
    };
    expect(() => alunos.processarFormularioDeCadastro(formData)).not.toThrow();
  });
});
