# Project conventions

Read [README.md](README.md) before you change the package. It explains the
case file format, determinism and how to add or change cases.

- The package contains data, a schema and checks only. Do not add validator
  code.
- A case says what is correct. Do not record which implementations differ.
- Keep `schema.json`, `scripts/check.mjs` and the README in agreement when the
  format changes.
- Run `npm ci` and `npm test` before you commit.
- Add a line to `CHANGELOG.md` under `## Unreleased`.
- Change `main` through PRs only. Do not tag or publish.

## Public repository

This repository is public. Anyone can read everything in it and everything
posted to it: case data, code, comments, docs, commit messages, branch names,
issues, PRs and review comments. Never include:

- Internal document content: internal specs, design notes, meeting notes or
  ticket text. Reference an internal issue by bare ID only (see below).
- Internal URLs, hostnames or IP addresses, or links to private repositories,
  dashboards and tools.
- Customer details, including B2B customers and their end customers: names,
  brands, domains, email addresses, order, account or service IDs.
- Third-party names other than this package's dependencies. Name a dependency
  only in the context of its use.
- Credentials: API keys, tokens, passwords, client certificates or private
  keys, and real configuration values.
- Commercial details: prices, contract terms, account entitlements.
- Real data in cases, and unredacted provider requests, responses or logs.
  Use placeholders such as `example.com`.

A dependency's public documentation is fine to cite. When in doubt, leave it
out and ask.

## Writing style

Write every text a human reads — chat replies, code comments, docblocks,
commit messages, PR bodies, docs — in terse Simplified Technical English (STE):

- One idea per sentence. Short sentences. Active voice, present tense.
- State each fact or rule once. Do not restate it, pad it, or explain what the
  code already shows.
- Cut hedging and filler ("essentially", "it's worth noting", "in order to",
  "please note that").
- A docblock says what a thing is and any non-obvious constraint — not a
  narrative. If a comment runs longer than the code it describes, cut it.

## Issue references

Reference an internal issue by its bare ID only (e.g. `ABC-123`) in branch
names, commit messages, and PR titles and bodies. Do not link to the issue
tracker or name it. A link can make the tracker's GitHub integration copy
ticket content into GitHub.

GitHub turns `#123`, `GH-123` and `owner/repo#123` into links. Use them only for
this repository's own issues and PRs. Never write an internal ID or any other
number in these forms: GitHub links it to an unrelated issue or PR. Write `@`
only to mention a GitHub user on purpose.