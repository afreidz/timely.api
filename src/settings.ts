import * as db from "./db";
import { Request, Router } from "express";
import { ITokenPayload } from "passport-azure-ad";
import { Collection, MongoServerError } from "mongodb";

const router = Router();

export interface SettingsRequest extends Request {
  owner?: string;
  collection?: Collection;
}

router.use("/", async (req: SettingsRequest, _, next) => {
  await db.connect();
  req.owner = (req.authInfo as ITokenPayload).oid || "";
  req.collection = db.client.collection("settings");
  return next();
});

router.get("/", async (req: SettingsRequest, res) => {
  const result = await req.collection?.findOne({ owner: req.owner });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.put("/", async (req: SettingsRequest, res) => {
  const result = await req.collection?.findOneAndUpdate(
    {
      owner: req.owner,
    },
    {
      $set: {
        owner: req.owner,
        theme: req.body.theme ?? "dark",
        endofday: req.body.endofday || "",
        gapless: req.body.gapless || false,
        showHours: req.body.showHours || [],
        autoStop: req.body.autoStop || false,
        startofday: req.body.startofday || "",
        multipleRunning: req.body.multipleRunning || false,
      },
    },
    { upsert: true }
  );
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
