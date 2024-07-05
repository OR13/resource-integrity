# Resource Integrity

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action prevents applications from accidentally bundling stale resources.

It can be used to provide continious assurance of W3C Verifiable Credential type
interoperability.

## Usage

Obtaining a hash for a resource:

```bash
curl -fLs https://www.w3.org/ns/credentials/v2 > ./__tests__/data/vcdm.v2.jsonld
sha256sum ./__tests__/data/vcdm.v2.jsonld

curl -fLs https://json-schema.org/draft/2020-12/schema > \
./__tests__/data/2020-12.schema.json
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

Prevent applications from building when resources have changed:

```yaml
- name: Ensure Resource Integrity
  id: resource-integrity
  uses: or13/resource-integrity@main
  with:
    resources: ./__tests__/data/resources.yaml
```

### W3C Verifiable Credentials

Please read [RFC9413](https://datatracker.ietf.org/doc/rfc9413/).

A credential which is all of these types "VerifiableCredential",
"ExampleDegreeCredential", "ExamplePersonCredential":

```json
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://www.w3.org/ns/credentials/examples/v2"
  ],
  "id": "http://university.example/credentials/3732",
  "type": [
    "VerifiableCredential",
    "ExampleDegreeCredential",
    "ExamplePersonCredential"
  ],
  "issuer": "https://university.example/issuers/14",
  "validFrom": "2010-01-01T19:23:24Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "degree": {
      "type": "ExampleBachelorDegree",
      "name": "Bachelor of Science and Arts"
    },
    "alumniOf": {
      "name": "Example University"
    }
  },
  "credentialSchema": [
    {
      "id": "https://example.org/examples/degree.json",
      "type": "JsonSchema"
    },
    {
      "id": "https://example.org/examples/alumni.json",
      "type": "JsonSchema"
    }
  ]
}
```

Example of protecting all resources necessary for credential type
interoperability:

```yaml
resources:
  - id: https://www.w3.org/ns/credentials/v2
    media-type: application/ld+json
    cached-resource: ...
  - id: https://www.w3.org/ns/credentials/examples/v2
    media-type: application/ld+json
    cached-resource: ...
  - id: https://example.org/examples/degree.json
    media-type: application/schema+json
    cached-resource: ...
  - id: https://example.org/examples/alumni.json
    media-type: application/schema+json
    cached-resource: ...
```

Application code is then configured to resolve these resources from a local
bundled cache.

If any of the resources change, the application developer is notified that the
credential type is no longer interoperable the next time the application is
built.

The developer can then decide how they want to address this problem, for example
they could:

1. Ignore the remote changes, and break compatiblity with implementations that
   take the remote changes.
1. Take the remote changes, and break compatiblity with other implementations
   that do not take the remote changes.
1. Contact the host of the resources that have changed, and ask for them to
   revert the changes.
1. Treat schema validation or context changes as warnings instead of errors.
1. Treat the credential as invalid and add these resources to a deny-list.

Although this action does not recommend any specific resolution to a detected
problem in credential type integrity, issuer's that produce credentials with
integrity problems, should probably not be trusted by verifiers.

This advice applies to credential type integrity problems detected in protocols
other than HTTPS, despite this action only supporting detecting of integrity
problems in HTTPS resources.
