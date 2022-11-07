import * as db from "./db";
import sanitize from "mongo-sanitize";
import { Request, Router } from "express";
import { ITokenPayload } from "passport-azure-ad";
import { Collection, MongoServerError, ObjectId } from "mongodb";

const router = Router();

export interface ProjectRequest extends Request {
  owner?: string;
  collection?: Collection;
}

router.use("/", async (req: ProjectRequest, _, next) => {
  await db.connect();
  req.owner = (req.authInfo as ITokenPayload).oid || "";
  req.collection = db.client.collection("projects");
  return next();
});

router.get("/", async (req: ProjectRequest, res) => {
  await db.connect();
  const result = await req.collection?.find({ owner: req.owner }).toArray();
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.post("/", async (req: ProjectRequest, res) => {
  await db.connect();

  const { name, color, budget, archived } = sanitize(req.body);
  console.log({ name, color, budget, archived });

  const result = await req.collection?.insertOne({
    name,
    color,
    budget,
    archived,
    owner: req.owner,
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.put("/:id", async (req: ProjectRequest, res) => {
  await db.connect();
  const id = sanitize(req.params.id);
  const { name, color, budget, archived } = sanitize(req.body);

  const result = await req.collection?.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      owner: req.owner,
    },
    {
      $set: {
        name,
        color,
        budget,
        archived,
      },
    }
  );

  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/", async (req: ProjectRequest, res) => {
  await db.connect();
  const result = await req.collection?.deleteMany({ owner: req.owner });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/:id", async (req: ProjectRequest, res) => {
  await db.connect();
  const id = sanitize(req.params.id);
  const result = await req.collection?.deleteOne({
    owner: req.owner,
    _id: new ObjectId(id),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
