import * as client from 'openid-client';
import { config } from '../config/env.js';

let oidcConfig: client.Configuration | null = null;

const ISSUER_URLS: Record<string, string> = {
  microsoft: 'https://login.microsoftonline.com/common/v2.0',
  google: 'https://accounts.google.com',
};

export async function initOAuth(): Promise<void> {
  if (config.oauthProvider === 'none') {
    console.log('[OAuth] Provider set to "none" — OAuth disabled');
    return;
  }

  const issuerUrl = config.oauthProvider === 'oidc'
    ? config.oauthIssuerUrl
    : ISSUER_URLS[config.oauthProvider];

  if (!issuerUrl) {
    throw new Error(`[OAuth] Unknown provider "${config.oauthProvider}" and no OAUTH_ISSUER_URL set`);
  }

  if (!config.oauthClientId || !config.oauthClientSecret) {
    throw new Error('[OAuth] OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET are required');
  }

  oidcConfig = await client.discovery(
    new URL(issuerUrl),
    config.oauthClientId,
    config.oauthClientSecret
  );

  console.log(`[OAuth] Discovered OIDC provider: ${issuerUrl}`);
}

export function isOAuthEnabled(): boolean {
  return oidcConfig !== null;
}

export async function buildAuthUrl(state: string, codeVerifier: string): Promise<string> {
  if (!oidcConfig) throw new Error('OAuth not initialized');

  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const params: Record<string, string> = {
    redirect_uri: config.oauthCallbackUrl,
    scope: config.oauthScopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  };

  return client.buildAuthorizationUrl(oidcConfig, params).href;
}

export async function handleCallback(
  callbackUrl: URL,
  expectedState: string,
  codeVerifier: string
): Promise<{ email: string; name: string; sub: string }> {
  if (!oidcConfig) throw new Error('OAuth not initialized');

  const tokens = await client.authorizationCodeGrant(oidcConfig, callbackUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
  });

  const claims = tokens.claims();
  if (!claims) throw new Error('No ID token claims returned');

  const email = (claims.email as string) || '';
  const name = (claims.name as string) || email.split('@')[0] || 'Unknown';
  const sub = claims.sub || '';

  if (!email) throw new Error('No email claim in ID token');

  return { email, name, sub };
}
