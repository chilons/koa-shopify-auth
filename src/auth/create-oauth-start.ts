import { Context } from 'koa';

import { OAuthStartOptions } from '../types';

import Error from './errors';
import oAuthQueryString from './oauth-query-string';

import { TOP_LEVEL_OAUTH_COOKIE_NAME } from './index';

export default function createOAuthStart(
  options: OAuthStartOptions,
  callbackPath: string
) {
  return function oAuthStart(ctx: Context) {
    const { myShopifyDomain } = options;
    const { query } = ctx;
    const { shop, accessMode } = query;

    const shopRegex = new RegExp(
      `^[a-z0-9][a-z0-9\\-]*[a-z0-9]\\.${myShopifyDomain}$`,
      'i'
    );

    if (shop == null || !shopRegex.test(shop)) {
      ctx.throw(400, Error.ShopParamMissing);
      return;
    }

    let authOptions = options;
    if (accessMode && ['online', 'offline'].includes(accessMode)) {
      authOptions = { ...options, accessMode };
    }

    ctx.cookies.set(TOP_LEVEL_OAUTH_COOKIE_NAME);

    const formattedQueryString = oAuthQueryString(
      ctx,
      authOptions,
      callbackPath
    );

    ctx.redirect(
      `https://${shop}/admin/oauth/authorize?${formattedQueryString}`
    );
  };
}
