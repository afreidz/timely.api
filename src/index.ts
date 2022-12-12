import cors from "./cors";
import morgan from "morgan";
import express from "express";
import timers from "./timers";
import * as auth from "./auth";
import passport from "passport";
import projects from "./projects";
import settings from "./settings";
import forecasts from "./forecasts";

const app = express();
const port = process.env.AC_PORT;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(passport.initialize());
passport.use(auth.strategy);

app.get("/health", (_, res) => {
  res.status(200).json({ msg: "alive" });
});

app.use("/timers", auth.protect(), timers);
app.use("/projects", auth.protect(), projects);
app.use("/settings", auth.protect(), settings);
app.use("/forecasts", auth.protect(), forecasts);

app.listen(port, () => console.log("Listening on port", port));
