---
id: managing-remotes
title: Managing Remotes
sidebar_label: Managing Remotes
sidebar_position: 2
description: Learn about managing remotes in a Permguard workspace
---

A recommended **Permguard** best practice is to run a **dedicated Server** for each environment, such as:

- **Development**
- **Staging**
- **Production**

This separation ensures a secure and isolated trust model aligned with the specific needs of each environment.

## Managing multiple Servers

When handling multiple **Servers** and provisioning configurations, it is crucial to correctly configure **remote connections**.
This setup enables smooth communication and coordination between different **Permguard instances**.

To add a new **remote**, use the following **remote command**:

```bash
 permguard remote add origin localhost
```

and it can be removed using the remote command:

```bash
 permguard remote remove origin
```

If the Server ports differ from the default values (`zap`:`9091` and `pap`:`9092`), you can specify the custom port numbers using the `--zap` and `--pap` flags:

```bash
 permguard remote add origin localhost --zap 9091 --pap 9092
```

### Configuring the gRPC scheme

By default, the gRPC scheme (`grpc` for plaintext, `grpcs` for TLS) is automatically determined based on the TLS flags. However, you can explicitly set the scheme using the `--scheme` flag:

```bash
 permguard remote add origin localhost --scheme grpcs
```

The scheme is persisted in the workspace configuration file (`.permguard/config`) and used for all subsequent operations (`checkout`, `pull`, `push`) on that remote.

If the configured scheme conflicts with the TLS flags (e.g., `--scheme grpc` with `--tls-skip-verify`), Permguard will return an error indicating the misconfiguration.
