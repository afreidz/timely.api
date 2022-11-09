import cors from "cors";

function checkOrigin(
  origin: string | undefined,
  cb: (err: Error | null, o?: string) => void
) {
  if (origin?.startsWith("http://localhost:")) return cb(null, origin);
  if (origin && process.env.AC_CORS_ORIGIN?.split(",").includes(origin)) {
    return cb(null, origin);
  }
  return cb(new Error("Origin not allowed"));
}

export default function () {
  return cors({
    origin: checkOrigin,
  });
}
