import * as db from "./db";
import { Request, Router } from "express";
import { ITokenPayload } from "passport-azure-ad";
import { Collection, MongoServerError, ObjectId } from "mongodb";

const router = Router();

export interface TimerRequest extends Request {
  owner?: string;
  collection?: Collection;
}

router.use("/", async (req: TimerRequest, _, next) => {
  await db.connect();
  req.owner = (req.authInfo as ITokenPayload).oid || "";
  req.collection = db.client.collection("timers");
  return next();
});

router.get("/", async (req: TimerRequest, res) => {
  const result = await req.collection?.find({ owner: req.owner }).toArray();
  res
    .status(result instanceof MongoServerError ? 500 : 200)
    .json(result instanceof MongoServerError ? [] : result);
});

router.post("/", async (req: TimerRequest, res) => {
  const result = await req.collection?.insertOne({
    owner: req.owner,
    projectId: req.body.projectId,
    task: req.body.task || "Timer",
    start: new Date(req.body.start),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.put("/:id", async (req: TimerRequest, res) => {
  const result = await req.collection?.findOneAndUpdate(
    {
      _id: new ObjectId(req.params.id),
      owner: req.owner,
    },
    {
      $set: {
        projectId: req.body.projectId,
        task: req.body.task || "Timer",
        start: new Date(req.body.start),
        afterhours: new Boolean(req.body.afterhours),
        end: req.body.end ? new Date(req.body.end) : null,
      },
    }
  );
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.get("/date/:ms", async (req: TimerRequest, res) => {
  const start = new Date(+req.params.ms);
  start.setHours(0);
  start.setMinutes(0);

  const end = new Date(+req.params.ms);
  end.setHours(24);
  end.setMinutes(0);

  const result = await req.collection
    ?.find({
      $and: [
        {
          owner: req.owner,
          start: { $gte: start, $lte: end },
        },
      ],
    })
    .toArray();
  res
    .status(result instanceof MongoServerError ? 500 : 200)
    .json(result instanceof MongoServerError ? [] : result);
});

router.get("/project/:pid", async (req: TimerRequest, res) => {
  const result = await req.collection
    ?.find({
      $and: [
        {
          owner: req.owner,
          projectId: req.params.pid,
        },
      ],
    })
    .toArray();
  res
    .status(result instanceof MongoServerError ? 500 : 200)
    .json(result instanceof MongoServerError ? [] : result);
});

router.delete("/", async (req: TimerRequest, res) => {
  const result = await req.collection?.deleteMany({ owner: req.owner });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/:id", async (req: TimerRequest, res) => {
  const result = await req.collection?.deleteOne({
    owner: req.owner,
    _id: new ObjectId(req.params.id),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
