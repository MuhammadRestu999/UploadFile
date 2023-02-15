require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORTS = process.env.PORT || [8080, 5218, 3000];
const { color } = require("./lib/color.js");

app.enable("trust proxy");
app.set("json spaces", 2);
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  abortOnLimit: true,
  debug: true
}));
app.use(["/admin/", "/delete"], (req, res, next) => {
  if(req.method != "GET" && req.originalUrl == "/admin") return next();
  if(req.method != "POST" && req.originalUrl == "/delete") return next();

  const auth = {
    login: process.env.user,
    password: process.env.password
  };
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");

  if(!login || !password || login != auth.login || password != auth.password) {
    res.set("WWW-Authenticate", "Basic realm=\"401\"")
    res.status(401).send(`<h1>401</h1><p>${login && (login != auth.login || password != auth.password) ? "Incorrect username or password." : "Authentication required."}</p>`)
  } else {
    next();
  };
});
app.use(express.static("public"));

app.get("/list.json", (req, res) => {
  function f(v) {
    const s = fs.statSync(`upload/${v}`);
    return {
      name: v,
      size: s.size,
      date: s.birthtime
    }
  };
  res.send(fs.readdirSync("upload").filter(v => v != ".gitkeep").map(f));
});
app.get("/u/:file", (req, res, next) => {
  const { file } = req.params;
  const p = `${__dirname}/upload/${file}`;
  if(!fs.existsSync(p)) return next();

  res.sendFile(p);
});

app.post("/upload", async(req, res) => {
  if(!req.files?.["files[]"]) return res.status(422).send("No files uploaded");

  let files = req.files["files[]"];
  if(!Array.isArray(files)) files = [files];

  const e = [];
  const u = [];
  for(const file of files) {
    const name = crypto.randomBytes(4).toString("hex") + path.extname(file.name);

    try {
      await file.mv("upload/" + name);
      u.push([file.name, name]);
    } catch(err) {
      console.error(err);
      e.push(err);
    };
  };

  if(!u.length) return res.status(500).send(e);

  return res.status(200).send({
    message: `Successfully uploaded ${u.length} files${e.length ? ", failed to upload " + e.length + " files" : ""}`,
    uploaded: u,
    errors: e
  });
});
app.post("/delete", (req, res) => {
  const { name } = req.body;
  if(!fs.existsSync("upload/" + name)) return res.status(404).send({
    message: "File not found."
  });

  fs.unlinkSync("upload/" + name);
  res.status(200).send({
    message: "File successfully deleted."
  });
});


const listen = PORT => new Promise((r) => {
  app.listen(PORT, () => {
    console.log(color("Server running on port " + PORT, "green"));
  }).on("error", (err) => {
    if(err && err.code == "EADDRINUSE") console.log(color(`Cannot use port ${PORT} because it is in use`, "red"));
    if(err && err.code != "EADDRINUSE") {
      console.error(err);
      process.exit(1);
    };
    r(false);
  }).on("listening", () => r(true));
});

(async() => {
  if(Array.isArray(PORTS)) {
    for(const PORT of PORTS) {
      const lstn = await listen(PORT);
      if(lstn) break
    }
  } else await listen(PORTS);
})();
