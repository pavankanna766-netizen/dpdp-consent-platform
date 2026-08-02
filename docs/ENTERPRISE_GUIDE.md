# PrivyStack Enterprise Administration & SSO/SCIM Deployment Guide

## Overview
This guide provides IT Administrators and Enterprise Architects with instructions for configuring Microsoft Entra ID (Azure AD), Google Workspace SSO, SAML 2.0, and SCIM automated user provisioning.

---

## 1. Single Sign-On (SSO) Configuration

### 1.1 Microsoft Entra ID (Azure AD)
1. Register a new Enterprise Application in Microsoft Entra Admin Center.
2. Select **Single Sign-On** → **SAML**.
3. Configure **Basic SAML Configuration**:
   - Identifier (Entity ID): `https://auth.privystack.com/saml/metadata`
   - Reply URL (Assertion Consumer Service URL): `https://api.privystack.com/api/organization/saml/acs`
4. Copy the **App Federation Metadata Url** and input into PrivyStack Dashboard (**Organization Settings** → **SSO**).

---

## 2. SCIM User & Group Provisioning
PrivyStack supports SCIM 2.0 protocol for automatic user provisioning:
- **SCIM Endpoint**: `https://api.privystack.com/scim/v2`
- **Supported Operations**: `User.Create`, `User.Update`, `User.Deactivate`, `Group.Sync`.
