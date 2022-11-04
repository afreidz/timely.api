import passport from "passport";
import { BearerStrategy, ITokenPayload } from "passport-azure-ad";

const scope = ["access_as_user"];
export const strategy = new BearerStrategy(
  {
    identityMetadata: process.env.AZURE_ID_META_URL || "",
    issuer: process.env.AZURE_ISSUER_URL || "",
    clientID: process.env.AZURE_CLIENT_ID || "",
    audience: process.env.AZURE_CLIENT_ID || "",
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
