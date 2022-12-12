import getDbClient from "./db";
import sanitize from "mongo-sanitize";
import { Request, Router } from "express";
import { ITokenPayload } from "passport-azure-ad";
import { Collection, MongoServerError, ObjectId } from "mongodb";

const router = Router();

export interface ForecastRequest extends Request {
  owner?: string;
  collection?: Collection;
}

router.use("/", async (req: ForecastRequest, _, next) => {
  const db = await getDbClient();
  req.owner = (req.authInfo as ITokenPayload).oid || "";
  req.collection = db.collection("forecasts");
  return next();
});

router.get("/weekof/:ms", async (req: ForecastRequest, res) => {
  const weekof = new Date(+sanitize(req.params.ms));

  const result = await req.collection
    ?.find({
      $and: [
        {
          owner: req.owner,
          weekof,
        },
      ],
    })
    .toArray();

  res
    .status(result instanceof MongoServerError ? 500 : 200)
    .json(result instanceof MongoServerError ? [] : result);
});

router.put("/", async (req: ForecastRequest, res) => {
  const { projectId, weekof, hours } = sanitize(req.body);
  const query = { projectId, weekof, owner: req.owner };

  const result = await req.collection?.updateOne(
    query,
    {
      $set: {
        projectId,
        hours: hours || 0,
        weekof: new Date(weekof),
      },
    },
    { upsert: true }
  );
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/", async (req: ForecastRequest, res) => {
  const result = await req.collection?.deleteMany({ owner: req.owner });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/:id", async (req: ForecastRequest, res) => {
  const id = sanitize(req.params.id);
  const result = await req.collection?.deleteOne({
    owner: req.owner,
    _id: new ObjectId(id),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
