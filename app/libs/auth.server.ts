// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { sessionStorage } from "~/libs/session.server";
import { prisma } from "./prisma.server";
import { redirect } from "@remix-run/node";
import { env } from "./env/env.server";

interface Userinfo {
  sub: string,
  iss: string,
  aud: string,
  preferred_username: string,
  name: string,
  email_verified: boolean,
  picture: string
}


// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<{ id: string, username: string }>(sessionStorage);

authenticator.use(new OAuth2Strategy({
  clientId: env.CASDOOR_CLIENT_ID,
  clientSecret: env.CASDOOR_CLIENT_SECRET,
  authorizationEndpoint: `${env.CASDOOR_URL}/login/oauth/authorize/`,
  tokenEndpoint: `${env.CASDOOR_URL}/api/login/oauth/access_token`,
  redirectURI: "http://localhost:3000/callback",
  scopes: ["openid", "profile"],
  authenticateWith: "request_body"
},
  async ({ tokens, profile, context, request }) => {
    const { access_token: accessToken, refresh_token: refreshToken } = tokens;
    const res = await fetch(`${env.CASDOOR_URL}/api/userinfo?accessToken=${tokens.access_token}`)
    const userinfo = await res.json() as Userinfo
    const foundUser = await prisma.user.findFirst({ where: { sub: userinfo.sub } })
    if (foundUser) return { id: foundUser.id, username: foundUser.username };

    const createdUser = await prisma.user.create({
      data: {
        username: userinfo.name,
        sub: userinfo.sub
      }, select: { id: true, username: true }
    })

    return { ...createdUser, accessToken, refreshToken }
  }), "casdoor")

export async function getUserId(request: Request) {
  const authSession = await sessionStorage.getSession(request.headers.get('cookie'));
  const sessionId = await authSession.get(authenticator.sessionKey);
  if (!sessionId) return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(authSession)
    }
  });

  return sessionId.id;
}