# Validation conformance cases

This package defines the expected behaviour of every validation rule that
[`upmind/provision-provider-base`](https://github.com/upmind/provision-provider-base)
data sets can use. Every validator implementation must pass every case.

The package contains data, a schema and checks. It contains no validator code.
Each consumer keeps its own runner.

`upmind/provision-provider-base` defines the supported rules. Each supported
rule has one case file, `validation/<rule>.json`.

## Install

```sh
composer require --dev upmind/provision-validation-conformance
npm install --save-dev @upmind/provision-validation-conformance
```

Both packages have the same content and the same version.

## Case file format

`schema.json` is the JSON Schema of a case file.

```json
{
  "rule": "max",
  "cases": [
    {
      "name": "string at the maximum length",
      "rules": { "value": ["string", "max:3"] },
      "data": { "value": "abc" },
      "valid": true
    },
    {
      "name": "string over the maximum length",
      "rules": { "value": ["string", "max:3"] },
      "data": { "value": "abcd" },
      "valid": false,
      "failed": { "value": ["max"] }
    }
  ]
}
```

- `rule`: the canonical rule name. It is the same as the file name.
- `name`: the case name. It is unique in the file. `rule` and `name` together
  identify the case.
- `rules`: the rules of each field. Each value is a list of rule strings.
  Field names can use dot notation and `*` wildcards.
- `data`: the input data. A field that is not in `data` is missing.
- `valid`: whether the data passes all rules.
- `failed`: for invalid cases only. The rules that fail, per field. The order
  is not significant.

## Known differences

A case says what is correct. It does not say which implementations differ.

If an implementation cannot pass a case yet, its runner keeps a list of known
differences. This package does not.

Identify a case by `rule` and `name`, not by its position in the file.

## Rule names

A rule string is `name` or `name:parameters`. The canonical name is snake case.
Validators must accept these aliases: `alpha-score`, `alpha-dash-dot`,
`domain-name`, `bool` (`boolean`) and `int` (`integer`).

## Determinism

- Cases do not depend on the current date, the network, a database or files.
- Date cases use fixed dates.
- `regex` patterns use PCRE syntax.
- `country_code` and `international_phone` depend on ISO 3166 and phone number
  metadata. Cases use stable values.

## Write a runner

Read every `validation/*.json` file from the installed package:

- Composer: `vendor/upmind/provision-validation-conformance/validation`
- npm: `node_modules/@upmind/provision-validation-conformance/validation`

For each case:

1. Validate `data` against `rules`.
2. Get the canonical names of the failed rules, per field.
3. The case conforms if the result equals `valid` and the failed rules equal
   `failed`. Ignore the order. A valid case has no failed rules. An error,
   e.g. an exception, does not conform.
4. If the case is in your list of known differences, check that the case does
   not conform. This finds entries that are out of date. Otherwise, check that
   the case conforms.

Also check that your list of supported rules equals the list of case files.

## Add or change cases

1. Edit `validation/<rule>.json`. Keep the keys `name`, `rules`, `data`,
   `valid` first, in that order.
2. Run the checks:

   ```sh
   npm ci
   npm test
   ```

3. Add a line to `CHANGELOG.md`.

Do not rename a case without a reason. Runners refer to cases by `rule` and
`name`.

## License

GPL-3.0-only. See [LICENSE](LICENSE).
