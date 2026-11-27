// Checks that every case file is well formed and that rules.json agrees with
// the case files. Exits with 1 on any error.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRECTORY = join(ROOT, 'validation');
const RULES = JSON.parse(readFileSync(join(ROOT, 'rules.json'), 'utf8'));
const ALIASES = RULES.aliases;
const FIRST_KEYS = ['name', 'rules', 'data', 'valid'];

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

    for (const rules of Object.values(c.rules)) {
      rules.forEach((rule) => usedRules.add(ruleName(rule)));
    }
  });

  if (!usedRules.has(name)) {
    error(`no case uses rule ${name}`);
  }
}

const isSorted = (list) => list.join() === [...list].sort().join();
const supported = RULES.rules;
const files = paths.map((path) => path.slice(0, -'.json'.length));

if (!isSorted(supported)) {
  errors.push('rules.json: rules is not sorted');
}

if (new Set(supported).size !== supported.length) {
  errors.push('rules.json: a rule is listed twice');
}

for (const rule of supported.filter((rule) => !files.includes(rule))) {
  errors.push(`rules.json: rule ${rule} has no case file`);
}

for (const rule of files.filter((rule) => !supported.includes(rule))) {
  errors.push(`rules.json: ${rule}.json has cases, but the rule is not in rules`);
}

for (const [alias, rule] of Object.entries(RULES.aliases)) {
  if (!supported.includes(rule) || supported.includes(alias)) {
    errors.push(`rules.json: alias ${alias} must name a rule and must not be one`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}

console.log(`OK: ${supported.length} supported rules, ${paths.length} case files, ${caseCount} cases`);
