import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const boardDir = path.join(root, 'src', 'data', 'boardPacks');
const questionDir = path.join(root, 'src', 'data', 'questionBanks');
const boardFiles = ['kamatz-patach', 'segol-tzere', 'hirik', 'holam', 'shuruk-kubutz', 'masa-hanikud'];
const errors = [];
let boardCount = 0;
let tileCount = 0;
let groupCount = 0;
let questionCount = 0;

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${path.relative(root, file)}: JSON לא תקין (${error.message})`);
    return undefined;
  }
};

for (const id of boardFiles) {
  const boardPath = path.join(boardDir, `${id}.json`);
  const bankPath = path.join(questionDir, `${id}.json`);
  const board = readJson(boardPath);
  const bank = readJson(bankPath);
  if (!board || !bank) continue;

  boardCount += 1;
  if (board.id !== id) errors.push(`${id}: מזהה הלוח בקובץ אינו תואם לשם הקובץ`);
  if (board.schemaVersion !== 2) errors.push(`${id}: schemaVersion של הלוח חייב להיות 2`);
  const expectedTiles = id === 'masa-hanikud' ? 60 : 30;
  if (!Array.isArray(board.path) || board.path.length !== expectedTiles) errors.push(`${id}: נדרשות בדיוק ${expectedTiles} משבצות`);
  if (bank.boardId !== id) errors.push(`${id}: מאגר השאלות משויך ללוח אחר (${bank.boardId})`);
  if (!bank.groups || typeof bank.groups !== 'object') errors.push(`${id}: חסר אובייקט groups במאגר השאלות`);

  const ids = new Set();
  const starts = new Set();
  for (let index = 0; index < (board.path ?? []).length; index += 1) {
    const tile = board.path[index];
    tileCount += 1;
    if (tile.id !== index + 1) errors.push(`${id}: מזהה משבצת לא רציף במיקום ${index + 1}`);
    if (ids.has(tile.id)) errors.push(`${id}: מזהה משבצת כפול ${tile.id}`);
    ids.add(tile.id);
    for (const key of ['center', 'anchor']) {
      const point = tile[key];
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
        errors.push(`${id}: ${key} לא תקין במשבצת ${tile.id}`);
      }
    }

    // The final tile is the finish tile; all other tiles must have usable questions.
    if (tile.id < expectedTiles) {
      const group = bank.groups?.[tile.questionGroup];
      if (!tile.label || typeof tile.label !== 'string') errors.push(`${id}: חסרה הברה במשבצת ${tile.id}`);
      if (!tile.questionGroup) errors.push(`${id}: חסר questionGroup במשבצת ${tile.id}`);
      else if (!tile.questionGroup.includes(':syllable-')) errors.push(`${id}: קבוצת השאלות אינה מבוססת הברה במשבצת ${tile.id}`);
      else if (!Array.isArray(group) || group.length === 0) errors.push(`${id}: אין שאלות לקבוצה ${tile.questionGroup} (משבצת ${tile.id})`);
      else if (group.some(question => question.symbol !== tile.label)) errors.push(`${id}: שאלות הקבוצה ${tile.questionGroup} אינן תואמות להברה ${tile.label}`);
    }
  }

  for (const transition of board.transitions ?? []) {
    if (starts.has(transition.from)) errors.push(`${id}: יותר ממעבר אחד מתחיל במשבצת ${transition.from}`);
    starts.add(transition.from);
    if (transition.from < 1 || transition.from > expectedTiles || transition.to < 1 || transition.to > expectedTiles) errors.push(`${id}: מעבר מחוץ לטווח`);
    if (transition.kind === 'ladder' && transition.to <= transition.from) errors.push(`${id}: סולם ${transition.from}->${transition.to} אינו עולה`);
    if (transition.kind === 'snake' && transition.to >= transition.from) errors.push(`${id}: נחש ${transition.from}->${transition.to} אינו יורד`);
  }

  for (const [groupId, questions] of Object.entries(bank.groups ?? {})) {
    groupCount += 1;
    if (!Array.isArray(questions) || questions.length === 0) continue;
    const questionIds = new Set();
    for (const question of questions) {
      questionCount += 1;
      if (question.groupId !== groupId) errors.push(`${id}/${groupId}: שאלה ${question.id} משויכת לקבוצה שגויה`);
      if (question.boardId !== id) errors.push(`${id}/${groupId}: שאלה ${question.id} משויכת ללוח שגוי`);
      if (questionIds.has(question.id)) errors.push(`${id}/${groupId}: מזהה שאלה כפול ${question.id}`);
      questionIds.add(question.id);
      if (!Array.isArray(question.answers) || question.answers.length < 2) errors.push(`${id}/${groupId}: לשאלה ${question.id} אין מספיק תשובות`);
      const answerIds = new Set((question.answers ?? []).map(answer => answer.id));
      if (!answerIds.has(question.correctAnswer)) errors.push(`${id}/${groupId}: תשובה נכונה לא קיימת בשאלה ${question.id}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`בדיקת התוכן נכשלה עם ${errors.length} בעיות:`);
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}`));
  process.exit(1);
}

console.log(`Content validation passed: ${boardCount} boards, ${tileCount} tiles, ${groupCount} groups, ${questionCount} questions.`);
