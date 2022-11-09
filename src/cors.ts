import cors from "cors";

function checkOrigin(
  origin: string | undefined,
  cb: (err: Error | null, o?: string) => void
) {
  const origins = process.env.AC_CORS_ORIGIN?.split(",");
  if (origin?.startsWith("http://localhost:")) return cb(null, origin);
  if (origin && origins?.some((o) => origin.startsWith(o))) {
    return cb(null, origin);
  }
  return cb(new Error("Origin not allowed"));
}

export default function () {
  return cors({
    origin: checkOrigin,
  });
}
