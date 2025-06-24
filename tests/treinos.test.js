const treinos = require('../src/core/treinos');

describe('assignWorkout', () => {
  let mockCentralSheet, mockStudentSheet, mockLogSheet, mockSpreadsheet, protections;
  let mockGetRange, mockSetValues, mockClearContent, mockAppendRow, mockGetValues, mockGetLastRow, mockProtect, mockRemove, mockGetProtections;

  beforeEach(() => {
    // Reset all mocks
    protections = {};
    mockSetValues = jest.fn();
    mockClearContent = jest.fn();
    mockAppendRow = jest.fn();
    mockGetLastRow = jest.fn(() => 0);
    mockProtect = jest.fn(() => {
      const protectMock = {
        setWarningOnly: jest.fn(),
        SHEET: true
      };
      return protectMock;
    });
    mockRemove = jest.fn();
    mockGetProtections = jest.fn(() => [ { remove: mockRemove, SHEET: true } ]);
    mockGetValues = jest.fn();

    // Central de Treinos mock data
    const centralData = [
      // Segunda-Feira (rows 6-15)
      ['Tipo', 'Ex1', '10x', '20kg', '', '', ''],
      ['', '', '', '', '', '', ''],
      // ...more rows as needed
    ];
    mockGetRange = jest.fn((row, col, numRows, numCols) => {
      const rangeMock = {
        getValues: jest.fn(() => centralData.slice(0, numRows)),
        setValues: mockSetValues,
        clearContent: mockClearContent,
        SHEET: true // Add SHEET property to all range mocks
      };
      return rangeMock;
    });

    // Add SHEET property to all sheet mocks if needed
    function addSheetProps(sheet) {
      sheet.SHEET = true;
      sheet.getRange = sheet.getRange || mockGetRange;
      sheet.getProtections = sheet.getProtections || mockGetProtections;
      sheet.protect = sheet.protect || mockProtect;
      sheet.getLastRow = sheet.getLastRow || mockGetLastRow;
      sheet.getName = sheet.getName || (() => 'Sheet');
      return sheet;
    }

    mockCentralSheet = addSheetProps({
      getRange: mockGetRange,
      getName: () => 'Central de Treinos',
      getLastColumn: () => 7,
      getProtections: mockGetProtections,
      getSheetName: () => 'Central de Treinos',
      getRange: jest.fn((a) => ({
        getValue: jest.fn(() => 'Test Student'),
        SHEET: true
      }))
    });

    mockStudentSheet = addSheetProps({
      getRange: mockGetRange,
      getProtections: mockGetProtections,
      protect: mockProtect,
      getLastRow: mockGetLastRow,
      getName: () => 'treino_semanal_Test Student'
    });

    mockLogSheet = addSheetProps({
      getRange: mockGetRange,
      getProtections: mockGetProtections,
      protect: mockProtect,
      appendRow: mockAppendRow,
      getLastRow: mockGetLastRow,
      getName: () => 'log_treinos'
    });

    mockSpreadsheet = {
      getSheetByName: jest.fn((name) => {
        if (name === 'Central de Treinos') return mockCentralSheet;
        if (name === 'treino_semanal_Test Student') return mockStudentSheet;
        if (name === 'log_treinos') return mockLogSheet;
        return null;
      }),
      getActiveSpreadsheet: jest.fn()
    };

    // Mock SpreadsheetApp global
    global.SpreadsheetApp = {
      getActiveSpreadsheet: jest.fn(() => mockSpreadsheet)
    };

    // Mock Logger
    global.Logger = { log: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should read workout data from Central de Treinos and write to student sheet', () => {
    treinos.assignWorkout();

    // Should clear old data in student sheet
    expect(mockClearContent).toHaveBeenCalled();

    // Should write new workout data to student sheet
    expect(mockSetValues).toHaveBeenCalled();

    // Should append a log row for each exercise
    expect(mockAppendRow).toHaveBeenCalled();

    // Should remove and re-apply protections
    expect(mockRemove).toHaveBeenCalled();
    expect(mockProtect).toHaveBeenCalled();
  });

  it('should throw if Central de Treinos sheet is missing', () => {
    mockSpreadsheet.getSheetByName = jest.fn((name) => (name === 'Central de Treinos' ? null : mockStudentSheet));
    expect(() => treinos.assignWorkout()).toThrow("Sheet 'Central de Treinos' not found.");
  });

  it('should throw if student name is missing in B2', () => {
    mockCentralSheet.getRange = jest.fn(() => ({ getValue: () => '' }));
    expect(() => treinos.assignWorkout()).toThrow("Student name not found in cell B2.");
  });

  it('should throw if student sheet is missing', () => {
    mockSpreadsheet.getSheetByName = jest.fn((name) => (name === 'Central de Treinos' ? mockCentralSheet : (name === 'treino_semanal_Test Student' ? null : mockLogSheet)));
    expect(() => treinos.assignWorkout()).toThrow("Student sheet 'treino_semanal_Test Student' not found.");
  });

  it('should throw if log_treinos sheet is missing', () => {
    mockSpreadsheet.getSheetByName = jest.fn((name) => (name === 'Central de Treinos' ? mockCentralSheet : (name === 'treino_semanal_Test Student' ? mockStudentSheet : null)));
    expect(() => treinos.assignWorkout()).toThrow("Sheet 'log_treinos' not found.");
  });

  // Add more tests as needed for edge cases and error handling
});
