import getDbClient from "./db";
import sanitize from "mongo-sanitize";
import { Request, Router } from "express";
import { ITokenPayload } from "passport-azure-ad";
import { Collection, MongoServerError, ObjectId } from "mongodb";

const router = Router();

export interface TimerRequest extends Request {
  owner?: string;
  collection?: Collection;
}

router.use("/", async (req: TimerRequest, _, next) => {
  const db = await getDbClient();
  req.owner = (req.authInfo as ITokenPayload).oid || "";
  req.collection = db.collection("timers");
  return next();
});

router.get("/", async (req: TimerRequest, res) => {
  const result = await req.collection?.find({ owner: req.owner }).toArray();
  res
    .status(result instanceof MongoServerError ? 500 : 200)
    .json(result instanceof MongoServerError ? [] : result);
});

router.post("/", async (req: TimerRequest, res) => {
  const { projectId, task, start } = sanitize(req.body);

  const result = await req.collection?.insertOne({
    projectId,
    owner: req.owner,
    task: task || "Timer",
    start: new Date(start),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.put("/:id", async (req: TimerRequest, res) => {
  const id = sanitize(req.params.id);
  const { projectId, task, start, afterhours, end } = sanitize(req.body);

  const result = await req.collection?.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      owner: req.owner,
    },
    {
      $set: {
        projectId,
        task: task || "Timer",
        start: new Date(start),
        end: end ? new Date(end) : null,
        afterhours: new Boolean(afterhours),
      },
    }
  );
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.get("/range/:start/:end", async (req: TimerRequest, res) => {
  const end = new Date(+sanitize(req.params.end));
  const start = new Date(+sanitize(req.params.start));

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

router.get("/date/:ms", async (req: TimerRequest, res) => {
  const start = new Date(+sanitize(req.params.ms));
  start.setHours(0);
  start.setMinutes(0);

  const end = new Date(+sanitize(req.params.ms));
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
  const projectId = sanitize(req.params.pid);
  const result = await req.collection
    ?.find({
      $and: [
        {
          projectId,
          owner: req.owner,
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
  const id = sanitize(req.params.id);
  const result = await req.collection?.deleteOne({
    owner: req.owner,
    _id: new ObjectId(id),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
