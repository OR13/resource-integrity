# Resource Integrity

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This GitHub action prevents software from building where there is a mismatch
between remote and local resources.

It was designed to support profiles of W3C Verifiable Credentials which require
this property to ensure interoperability.

## Usage

Obtaining a hash for a resource:

```bash
curl -fLs https://www.w3.org/ns/credentials/v2 > ./__tests__/data/vcdm.v2.jsonld
sha256sum ./__tests__/data/vcdm.v2.jsonld

curl -fLs https://json-schema.org/draft/2020-12/schema > ./__tests__/data/2020-12.schema.json
sha256sum ./__tests__/data/2020-12.schema.json
```

Creating a resources file:

```yaml
resources:
  - id: https://www.w3.org/ns/credentials/v2
    media-type: application/ld+json
    hash-algorithm: sha-256
    hash-digest: 31d22e074ea436daaaabd6954a8e73c634915e980d54656f044c7fb26fb490f6
    cached-resource: ./__tests__/data/vcdm.v2.jsonld
  - id: https://json-schema.org/draft/2020-12/schema
    media-type: application/schema+json
    hash-algorithm: sha-256
    hash-digest: 41da76f5afb7ce062d248f762463a92f7ca47e4e0f905b224ba6afeef91ded0f
    cached-resource: ./__tests__/data/2020-12.schema.json
```

Blocking continious integration if resources have changed:

```yaml
- name: Ensure Resource Integrity
  id: resource-integrity
  uses: or13/resource-integrity@main
  with:
    resources: ./__tests__/data/resources.yaml
```
