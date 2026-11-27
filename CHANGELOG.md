# Changelog

## 1.1.0

- Add `rules.json`: the supported rules and their aliases.
- Add cases for 75 more rules, e.g. `required_unless`, `between`, `after`,
  `uuid` and `distinct`. The package now has 113 case files.

## 1.0.0

First release.

- Validation conformance cases: one file per supported rule, as the shared
  spec for every validator implementation.
- `schema.json`: the JSON Schema of a case file.
- Case file checks, run in CI.
