# Resource Integrity 

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)


This GitHub action prevents software from building where there is a mismatch between remote and local resources.

It was designed to support profiles of W3C Verifiable Credentials which require this property to ensure interoperability.


## Alternatives

```
curl -fLs https://www.w3.org/ns/credentials/v2 > ./__tests__/data/vcdm.v2.jsonld
sha256sum ./__tests__/data/vcdm.v2.jsonld
```