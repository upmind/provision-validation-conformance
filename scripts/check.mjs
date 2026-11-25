// Checks that every case file is well formed. Exits with 1 on any error.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRECTORY = join(ROOT, 'validation');
const ALIASES = { bool: 'boolean', int: 'integer' };
const FIRST_KEYS = ['name', 'rules', 'data', 'valid'];
const VERSION = /^[0-9]+(\.[0-9]+)*$/;

/** Get the canonical name of a rule string: snake case, without parameters. */
function ruleName(rule) {
  const [name] = rule.trim().split(':');
  const studly = name
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  const snake = studly.replace(/(.)(?=[A-Z])/g, '$1_').toLowerCase();

  return ALIASES[snake] ?? snake;
}

const errors = [];
const validate = new Ajv2020({ allErrors: true, allowUnionTypes: true }).compile(
  JSON.parse(readFileSync(join(ROOT, 'schema.json'), 'utf8')),
);
const paths = readdirSync(DIRECTORY).filter((path) => path.endsWith('.json')).sort();
let caseCount = 0;

if (paths.length === 0) {
  errors.push('validation/ has no case files');
}

for (const path of paths) {
  const name = path.slice(0, -'.json'.length);
  const error = (message) => errors.push(`${path}: ${message}`);
  let file;

  try {
    file = JSON.parse(readFileSync(join(DIRECTORY, path), 'utf8'));
  } catch (e) {
    error(`invalid JSON: ${e.message}`);
    continue;
  }

  if (!validate(file)) {
    for (const { instancePath, message } of validate.errors) {
      error(`schema: ${instancePath || '/'} ${message}`);
    }
    continue;
  }

  if (file.rule !== name) {
    error(`rule is ${file.rule}, but the file name is ${name}`);
  }

  if (!file.cases.some((c) => c.valid)) {
    error('no valid case');
  }

  if (!file.cases.some((c) => !c.valid)) {
    error('no invalid case');
  }

  const names = new Set();
  const usedRules = new Set();

  file.cases.forEach((c, index) => {
    const label = `case #${index}`;
    caseCount++;

    if (names.has(c.name)) {
      error(`${label}: duplicate name "${c.name}"`);
    }
    names.add(c.name);

    if (Object.keys(c).slice(0, FIRST_KEYS.length).join() !== FIRST_KEYS.join()) {
      error(`${label}: keys must start with ${FIRST_KEYS.join(', ')}`);
    }

    if ('failed' in c === c.valid) {
      error(`${label}: failed must be present only on invalid cases`);
    }

    for (const [version, text] of Object.entries(c.corrections ?? {})) {
      if (!VERSION.test(version)) {
        error(`${label}: corrections key "${version}" is not a version`);
      }

      if (typeof text !== 'string' || text.trim() === '') {
        error(`${label}: corrections["${version}"] is empty`);
      }
    }

    for (const rules of Object.values(c.rules)) {
      rules.forEach((rule) => usedRules.add(ruleName(rule)));
    }
  });

  if (!usedRules.has(name)) {
    error(`no case uses rule ${name}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}

console.log(`OK: ${paths.length} case files, ${caseCount} cases`);
