---
id: transport-security
title: Transport Security
sidebar_label: Transport Security
sidebar_position: 8
description: Learn how to configure TLS, mTLS, and external TLS for secure communication between the Permguard CLI and Server.
---

Permguard supports multiple **transport security modes** to protect gRPC communication between the CLI (or any client) and the server. This guide walks through each mode with practical examples.

## TLS Modes Overview

The server's TLS mode is set at startup with the `--server-tls-mode` flag (or the `PERMGUARD_SERVER_TLS_MODE` environment variable). The CLI must then connect using the matching scheme and flags.

| Server Mode | Server Flag | CLI Scheme | Encryption | Identity Verification |
|-------------|-------------|------------|------------|----------------------|
| **none** | `--server-tls-mode=none` | `grpc://` | None | None |
| **tls** | `--server-tls-mode=tls` | `grpcs://` | Server-side TLS | Server only |
| **mtls** | `--server-tls-mode=mtls` | `grpcs://` | Mutual TLS | Server + Client |
| **external** | `--server-tls-mode=external` | `grpcs://` | Mutual TLS (infrastructure-provisioned certs) | Server + Client |

## Mode: none (Plaintext)

This is the **default** mode. No encryption is applied. Suitable for local development and testing.

### Server

```bash
docker run --rm -it \
  -p 9091:9091 \
  -p 9092:9092 \
  -p 9094:9094 \
  permguard/all-in-one:latest
```

No additional flags are needed since `none` is the default TLS mode.

### CLI

```bash
permguard config set zap-endpoint grpc://localhost:9091
permguard config set pap-endpoint grpc://localhost:9092
permguard config set pdp-endpoint grpc://localhost:9094

permguard zones list
```

:::warning
Plaintext mode transmits all data unencrypted. Do not use it in production or over untrusted networks.
:::

## Mode: tls (Server-Side TLS)

The server presents a TLS certificate and encrypts all traffic. Clients verify the server's identity but do not present their own certificate.

When using `--server-tls-mode=tls` **without** providing certificate files, the server automatically generates self-signed certificates in the `{appdata}/certs/` directory.

### Server with Auto-Generated Certificates

```bash
docker run --rm -it \
  -p 9091:9091 \
  -p 9092:9092 \
  -p 9094:9094 \
  -e PERMGUARD_SERVER_TLS_MODE="tls" \
  permguard/all-in-one:latest
```

The server generates certificates automatically. Since they are self-signed, the CLI must skip verification:

```bash
permguard config set zap-endpoint grpcs://localhost:9091
permguard config set pap-endpoint grpcs://localhost:9092
permguard config set pdp-endpoint grpcs://localhost:9094

permguard zones list --tls-skip-verify
```

:::caution
The `--tls-skip-verify` flag disables certificate verification. It is intended for development and testing only.
:::

### Server with Custom Certificates

To use your own certificates (e.g., from a corporate CA or Let's Encrypt):

```bash
docker run --rm -it \
  -p 9091:9091 \
  -p 9092:9092 \
  -p 9094:9094 \
  -v /path/to/certs:/certs:ro \
  -e PERMGUARD_SERVER_TLS_MODE="tls" \
  -e PERMGUARD_SERVER_TLS_CERT_FILE="/certs/server-cert.pem" \
  -e PERMGUARD_SERVER_TLS_KEY_FILE="/certs/server-key.pem" \
  permguard/all-in-one:latest
```

The CLI can then verify the server certificate using the CA:

```bash
permguard zones list --tls-ca-file /path/to/ca.pem
```

Or, if the CA is already trusted by the system's certificate store:

```bash
permguard zones list
```

### Server Flags Reference (tls)

| Flag | Environment Variable | Description |
|------|---------------------|-------------|
| `--server-tls-mode` | `PERMGUARD_SERVER_TLS_MODE` | Set to `tls` |
| `--server-tls-cert-file` | `PERMGUARD_SERVER_TLS_CERT_FILE` | Path to server certificate (PEM) |
| `--server-tls-key-file` | `PERMGUARD_SERVER_TLS_KEY_FILE` | Path to server private key (PEM) |
| `--server-tls-auto-cert-dir` | `PERMGUARD_SERVER_TLS_AUTO_CERT_DIR` | Directory for auto-generated certs (defaults to `{appdata}/certs/`) |

## Mode: mtls (Mutual TLS)

Both server and client present certificates and verify each other. This provides the strongest transport-level authentication.

### Server

```bash
docker run --rm -it \
  -p 9091:9091 \
  -p 9092:9092 \
  -p 9094:9094 \
  -v /path/to/certs:/certs:ro \
  -e PERMGUARD_SERVER_TLS_MODE="mtls" \
  -e PERMGUARD_SERVER_TLS_CERT_FILE="/certs/server-cert.pem" \
  -e PERMGUARD_SERVER_TLS_KEY_FILE="/certs/server-key.pem" \
  -e PERMGUARD_SERVER_TLS_CA_FILE="/certs/ca.pem" \
  permguard/all-in-one:latest
```

The `--server-tls-ca-file` (or `PERMGUARD_SERVER_TLS_CA_FILE`) specifies the CA used to verify client certificates.

### CLI

```bash
permguard config set zap-endpoint grpcs://localhost:9091
permguard config set pap-endpoint grpcs://localhost:9092
permguard config set pdp-endpoint grpcs://localhost:9094

permguard zones list \
  --tls-cert-file /path/to/client-cert.pem \
  --tls-key-file /path/to/client-key.pem \
  --tls-ca-file /path/to/ca.pem
```

### Server Flags Reference (mtls)

| Flag | Environment Variable | Description |
|------|---------------------|-------------|
| `--server-tls-mode` | `PERMGUARD_SERVER_TLS_MODE` | Set to `mtls` |
| `--server-tls-cert-file` | `PERMGUARD_SERVER_TLS_CERT_FILE` | Path to server certificate (PEM) |
| `--server-tls-key-file` | `PERMGUARD_SERVER_TLS_KEY_FILE` | Path to server private key (PEM) |
| `--server-tls-ca-file` | `PERMGUARD_SERVER_TLS_CA_FILE` | CA certificate for verifying client certs (PEM) |

### CLI Flags Reference (mtls)

| Flag | Description |
|------|-------------|
| `--tls-cert-file` | Path to client certificate (PEM) |
| `--tls-key-file` | Path to client private key (PEM) |
| `--tls-ca-file` | CA certificate for verifying the server (PEM) |

## Mode: external (Infrastructure-Managed TLS)

In this mode, the server performs **mutual TLS** using certificates provided by an external infrastructure component. The certificates are not created or managed by the operator — they are automatically provisioned and rotated by a trusted authority such as:

- **SPIRE/SPIFFE** — workload identity platform that mounts X.509 SVIDs via CSI driver volumes
- **HashiCorp Vault** — injects certificates via agent sidecar or init containers
- **cert-manager** — Kubernetes-native certificate lifecycle management
- **Istio / Envoy** — sidecar proxy that provisions mTLS certificates transparently

The key difference from `mtls` mode is **operational, not technical**: the server still requires `cert-file`, `key-file`, and `ca-file`, but these are sourced from the infrastructure rather than managed manually.

### Server

The server requires certificate paths, which point to files provisioned by the external provider:

```bash
docker run --rm -it \
  -p 9091:9091 \
  -p 9092:9092 \
  -p 9094:9094 \
  -v /spiffe-workload-api:/spiffe-workload-api:ro \
  -e PERMGUARD_SERVER_TLS_MODE="external" \
  -e PERMGUARD_SERVER_TLS_CERT_FILE="/spiffe-workload-api/svid.pem" \
  -e PERMGUARD_SERVER_TLS_KEY_FILE="/spiffe-workload-api/svid-key.pem" \
  -e PERMGUARD_SERVER_TLS_CA_FILE="/spiffe-workload-api/bundle.pem" \
  permguard/all-in-one:latest
```

In a **Kubernetes** environment with SPIRE, the certificates are mounted automatically via a CSI driver volume:

```yaml
volumes:
  - name: spiffe-workload-api
    csi:
      driver: "csi.spiffe.io"
      readOnly: true
containers:
  - name: permguard
    env:
      - name: PERMGUARD_SERVER_TLS_MODE
        value: "external"
      - name: PERMGUARD_SERVER_TLS_CERT_FILE
        value: "/spiffe-workload-api/svid.pem"
      - name: PERMGUARD_SERVER_TLS_KEY_FILE
        value: "/spiffe-workload-api/svid-key.pem"
      - name: PERMGUARD_SERVER_TLS_CA_FILE
        value: "/spiffe-workload-api/bundle.pem"
    volumeMounts:
      - name: spiffe-workload-api
        mountPath: /spiffe-workload-api
        readOnly: true
```

### CLI

The CLI connects using `grpcs://` and provides the appropriate CA (the trust bundle from the infrastructure):

```bash
permguard config set zap-endpoint grpcs://permguard.example.com:9091
permguard zones list --tls-ca-file /path/to/bundle.pem
```

For mTLS with the external provider, the CLI also presents its own SVID:

```bash
permguard zones list \
  --tls-cert-file /path/to/client-svid.pem \
  --tls-key-file /path/to/client-svid-key.pem \
  --tls-ca-file /path/to/bundle.pem
```

### Server Flags Reference (external)

| Flag | Environment Variable | Description |
|------|---------------------|-------------|
| `--server-tls-mode` | `PERMGUARD_SERVER_TLS_MODE` | Set to `external` |
| `--server-tls-cert-file` | `PERMGUARD_SERVER_TLS_CERT_FILE` | Path to server certificate provisioned by the external provider (PEM) |
| `--server-tls-key-file` | `PERMGUARD_SERVER_TLS_KEY_FILE` | Path to server private key provisioned by the external provider (PEM) |
| `--server-tls-ca-file` | `PERMGUARD_SERVER_TLS_CA_FILE` | Trust bundle / CA certificate for verifying client certs (PEM) |

:::info
In `external` mode, the infrastructure is responsible for **provisioning, rotating, and revoking** certificates. Permguard simply consumes the certificate files at the configured paths. When SPIRE rotates an SVID, the server picks up the new certificate automatically at the next TLS handshake.
:::

## Troubleshooting

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `connection reset by peer` | Plaintext client connecting to a TLS server | Switch endpoint to `grpcs://` |
| `first record does not look like a TLS handshake` | TLS client connecting to a plaintext server | Switch endpoint to `grpc://` |
| `certificate signed by unknown authority` | Server uses a self-signed or private CA certificate | Add `--tls-skip-verify` (dev) or `--tls-ca-file` (prod) |
| `certificate required` | Server requires mTLS but no client cert was provided | Add `--tls-cert-file` and `--tls-key-file` |
| `tls: mode=tls requires either cert-file+key-file or auto-cert-dir` | Server config missing cert paths | Provide cert files or let auto-cert generate them |

## Quick Reference

### Server Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PERMGUARD_SERVER_TLS_MODE` | `none` | TLS mode: `none`, `tls`, `mtls`, `external` |
| `PERMGUARD_SERVER_TLS_CERT_FILE` | — | Server certificate path (PEM) |
| `PERMGUARD_SERVER_TLS_KEY_FILE` | — | Server private key path (PEM) |
| `PERMGUARD_SERVER_TLS_CA_FILE` | — | CA for client verification in mTLS (PEM) |
| `PERMGUARD_SERVER_TLS_AUTO_CERT_DIR` | `{appdata}/certs/` | Directory for auto-generated certs |

### CLI Flags

| Flag | Description |
|------|-------------|
| `--tls-skip-verify` | Skip server certificate verification (dev only) |
| `--tls-ca-file` | CA certificate for server verification (PEM) |
| `--tls-cert-file` | Client certificate for mTLS (PEM) |
| `--tls-key-file` | Client private key for mTLS (PEM) |
