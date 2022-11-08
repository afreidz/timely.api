import cors from "cors";
import morgan from "morgan";
import express from "express";
import timers from "./timers";
import * as auth from "./auth";
import passport from "passport";
import projects from "./projects";
import settings from "./settings";
import { loadConfig } from "@app-config/main";
import { Config } from "./@types/lcdev__app-config";

let config: Config;
const app = express();

loadConfig()
  .then((c) => {
    config = c;
    app.use(cors({ origin: config.valid_origins }));
    app.use(passport.initialize());
    return auth.generateStrategy();
  })
  .then((strategy) => {
    passport.use(strategy);
    app.use(express.json());
    app.use(morgan("dev"));

    app.get("/health", (_, res) => {
      res.status(200).json({ msg: "alive" });
    });

    app.use("/timers", auth.protect(), timers);
    app.use("/projects", auth.protect(), projects);
    app.use("/settings", auth.protect(), settings);

    app.listen(config.port, () =>
      console.log("Listening on port", config.port)
    );
  });
