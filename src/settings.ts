import getDbClient from "./db";
import sanitize from "mongo-sanitize";
import { Request, Router } from "express";
import { ITokenPayload } from "passport-azure-ad";
import { Collection, MongoServerError } from "mongodb";

const router = Router();

export interface SettingsRequest extends Request {
  owner?: string;
  collection?: Collection;
}

router.use("/", async (req: SettingsRequest, _, next) => {
  const db = await getDbClient();
  req.owner = (req.authInfo as ITokenPayload).oid || "";
  req.collection = db.collection("settings");
  return next();
});

router.get("/", async (req: SettingsRequest, res) => {
  const result = await req.collection?.findOne({ owner: req.owner });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.put("/", async (req: SettingsRequest, res) => {
  const {
    theme,
    rounding,
    endofday,
    autoSnap,
    autoStop,
    showHours,
    startofday,
    multipleRunning,
  } = sanitize(req.body);

  const result = await req.collection?.findOneAndUpdate(
    {
      owner: req.owner,
    },
    {
      $set: {
        rounding,
        endofday,
        autoSnap,
        autoStop,
        startofday,
        multipleRunning,
        owner: req.owner,
        theme: theme ?? "dark",
        showHours: showHours || [],
      },
    },
    { upsert: true }
  );
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
