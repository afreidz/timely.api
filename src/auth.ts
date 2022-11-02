import passport from "passport";
import { BearerStrategy, ITokenPayload } from "passport-azure-ad";

const scope = ["access_as_user"];
export const strategy = new BearerStrategy(
  {
    identityMetadata:
      "https://login.microsoftonline.com/e85feadf-11e7-47bb-a160-43b98dcc96f1/v2.0/.well-known/openid-configuration",
    issuer:
      "https://login.microsoftonline.com/e85feadf-11e7-47bb-a160-43b98dcc96f1/v2.0",
    clientID: "e3e6d70e-ff2b-4c9a-b773-1bd7d9919593",
    audience: "e3e6d70e-ff2b-4c9a-b773-1bd7d9919593",
    // loggingLevel: "info",
    validateIssuer: true,
    scope,
  },
  (token: ITokenPayload, done) => {
    done(null, {}, token);
  }
);

export function protect() {
  return passport.authenticate("oauth-bearer", { session: false });
}
