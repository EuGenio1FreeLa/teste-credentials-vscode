# Personal Trainer Workout Management System

## Overview
A Google Apps Script project for managing student workouts, assignments, and performance tracking using Google Sheets as a database. Designed for personal trainers to streamline workout assignment and student management.

## Features
- Assign weekly workouts to students from a central template
- Log all workout assignments for historical tracking
- Student registration and management
- Sheet protection and permission handling
- Modern UI for student registration
- Jest-based unit testing

## Project Structure
```
/src
  /core
    alunos.js         // Student logic
    treinos.js        // Workout logic
    constants.js      // All CONSTANTES
    utils.js          // Shared helpers (if any)
  /ui
    cadastrarAluno.html
  index.js            // Main entry point (was code.js)
tests/
  treinos.test.js
  alunos.test.js
appsscript.json
package.json
README.md
```

## Development
- **Apps Script Deployment:** Uses [clasp](https://github.com/google/clasp) for deployment.
- **Testing:** Run `npm test` to execute Jest tests.
- **VS Code:** Recommended for editing and version control.

## Getting Started
1. Clone the repo and install dependencies: `npm install`
2. Set up your `.clasp.json` and Apps Script project.
3. Use `clasp push`/`clasp pull` to sync code.
4. Run tests with `npm test`.

## Contributing
Open issues or submit pull requests for improvements.

---