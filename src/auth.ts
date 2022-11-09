import passport from "passport";
import { BearerStrategy, ITokenPayload } from "passport-azure-ad";

const scope = ["access_as_user"];

const identityMetadata = process.env.AC_META_URL || "";
const clientID = process.env.AC_API_CLIENT_ID || "";
const issuer = process.env.AC_ISSUER_URL || "";

export const strategy = new BearerStrategy(
  {
    identityMetadata,
    clientID,
    issuer,
    scope,
  },
  (token: ITokenPayload, done) => {
    done(null, {}, token);
  }
);

export function protect() {
  return passport.authenticate("oauth-bearer", { session: false });
}
