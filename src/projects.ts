import * as db from "./db";
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
  const result = await req.collection?.find({ owner: req.owner }).toArray();
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.post("/", async (req: ProjectRequest, res) => {
  const result = await req.collection?.insertOne({
    owner: req.owner,
    name: req.body.name,
    color: req.body.color,
    budget: req.body.budget,
    archived: req.body.archived || false,
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.put("/:id", async (req: ProjectRequest, res) => {
  const result = await req.collection?.findOneAndUpdate(
    {
      _id: new ObjectId(req.params.id),
      owner: req.owner,
    },
    {
      $set: {
        name: req.body.name,
        color: req.body.color,
        budget: req.body.budget,
        archived: req.body.archived || false,
      },
    }
  );

  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/", async (req: ProjectRequest, res) => {
  const result = await req.collection?.deleteMany({ owner: req.owner });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

router.delete("/:id", async (req: ProjectRequest, res) => {
  const result = await req.collection?.deleteOne({
    owner: req.owner,
    _id: new ObjectId(req.params.id),
  });
  res.status(result instanceof MongoServerError ? 500 : 200).json(result);
});

export default router;
