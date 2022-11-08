import passport from "passport";
import { loadConfig } from "@app-config/main";
import { Config } from "./@types/lcdev__app-config";
import { BearerStrategy, ITokenPayload } from "passport-azure-ad";

export async function generateStrategy() {
  const scope = ["access_as_user"];
  const config: Config = await loadConfig();

  const identityMetadata = `${config.meta_url.proto}://${
    config.meta_url.host
  }/${config.tennant}${config.meta_url.path || ""}${
    config.meta_url.query || ""
  }`;

  const issuer = `${config.issuer_url.proto}://${config.issuer_url.host}/${
    config.tennant
  }${config.issuer_url.path || ""}${config.issuer_url.query || ""}`;

  return new BearerStrategy(
    {
      clientID: config.api_client_id,
      audience: config.api_client_id,
      validateIssuer: true,
      identityMetadata,
      issuer,
      scope,
    },
    (token: ITokenPayload, done) => {
      done(null, {}, token);
    }
  );
}

export function protect() {
  return passport.authenticate("oauth-bearer", { session: false });
}
