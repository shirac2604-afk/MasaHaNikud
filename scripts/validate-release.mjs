import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const boardDir = path.join(root, 'src', 'data', 'boardPacks');
const packagePath = path.join(root, 'package.json');
const errors = [];
const warnings = [];

const boardIds = ['kamatz-patach', 'segol-tzere', 'hirik', 'holam', 'shuruk-kubutz', 'masa-hanikud'];
const learningBoards = new Set(boardIds.filter(id => id !== 'masa-hanikud'));

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const packageJson = readJson(packagePath);

if (String(packageJson.version ?? '') !== '1.0.3') {
  errors.push(`package.json: גרסת ההפצה חייבת להיות 1.0.3 (נמצא ${packageJson.version})`);
}

let totalTransitions = 0;
for (const id of boardIds) {
  const boardPath = path.join(boardDir, `${id}.json`);
  if (!fs.existsSync(boardPath)) {
    errors.push(`${id}: קובץ הלוח חסר`);
    continue;
  }

  const board = readJson(boardPath);
  const imagePath = path.join(root, 'public', String(board.image ?? '').replace(/^\/+/, ''));
  if (!fs.existsSync(imagePath)) errors.push(`${id}: תמונת הלוח חסרה (${board.image})`);

  const previewPath = path.join(root, 'public', 'assets', 'boards', 'approved', `${id}.png`);
  if (!fs.existsSync(previewPath)) errors.push(`${id}: תמונת התצוגה המקדימה חסרה (${previewPath})`);

  const transitions = Array.isArray(board.transitions) ? board.transitions : [];
  totalTransitions += transitions.length;

  if (learningBoards.has(id)) {
    if (transitions.length !== 0) errors.push(`${id}: לוח לימודי חייב להיות ללא נחשים וסולמות`);
    if (board.layout?.renderTransitions !== false) errors.push(`${id}: renderTransitions חייב להיות false`);
    if ((board.path?.length ?? 0) !== 30) errors.push(`${id}: לוח לימודי חייב להכיל 30 תחנות`);
  } else {
    const ladders = transitions.filter(item => item.kind === 'ladder').length;
    const snakes = transitions.filter(item => item.kind === 'snake').length;
    if (ladders !== 4 || snakes !== 4) errors.push(`${id}: נדרשים 4 סולמות ו-4 נחשים (נמצא ${ladders}/${snakes})`);
    
    if ((board.path?.length ?? 0) !== 60) errors.push(`${id}: מסע הניקוד חייב להכיל 60 תחנות`);
  }

  const finish = board.path?.at(-1);
  if (!finish || finish.type !== 'finish') errors.push(`${id}: המשבצת האחרונה חייבת להיות finish`);

  const labels = new Set();
  for (const tile of board.path ?? []) {
    if (tile.id < (board.path?.length ?? 0)) {
      if (!tile.label || typeof tile.label !== 'string') errors.push(`${id}: חסרה הברה במשבצת ${tile.id}`);
      if (tile.label && labels.has(`${tile.id}:${tile.label}`)) warnings.push(`${id}: סימון כפול במשבצת ${tile.id}`);
      labels.add(`${tile.id}:${tile.label}`);
    }
  }
}

// Dice distribution matches the English GOLD behavior:
 // 1=27%, 2=26%, 3=26%, 4=7%, 5=7%, 6=7%.
const diceFile = fs.readFileSync(path.join(root, 'src', 'managers', 'DiceManager.ts'), 'utf8');
const requiredThresholds = ['roll <= 27', 'roll <= 53', 'roll <= 79', 'roll <= 86', 'roll <= 93'];
for (const threshold of requiredThresholds) {
  if (!diceFile.includes(threshold)) errors.push(`DiceManager: חסר סף הסתברות ${threshold}`);
}
if (!diceFile.includes('return 6;                 // 7%')) errors.push('DiceManager: תוצאת 6 חייבת להיות 7%');

if (errors.length > 0) {
  console.error(`Release validation failed with ${errors.length} issue(s):`);
  errors.forEach((error, index) => console.error(`${index + 1}. ${error}`));
  process.exit(1);
}

console.log(`Release validation passed: ${boardIds.length} boards, ${totalTransitions} total transitions, assets and previews present, final version verified.`);
if (warnings.length > 0) {
  console.warn(`Warnings (${warnings.length}):`);
  warnings.forEach((warning, index) => console.warn(`${index + 1}. ${warning}`));
}
