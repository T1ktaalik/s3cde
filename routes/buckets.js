var express = require("express");
var router = express.Router();
var jose = require("node-jose");
let path = require("path");
let fs = require("fs");
require("dotenv").config();
let axios = require("axios");

router.get("/", function (req, res) {
  let key = fs.readFileSync(
    require.resolve(path.join(__dirname, "../keyc.pem"))
  );
  let now = Math.floor(new Date().getTime() / 1000);
  let payload = {
    aud: "https://iam.api.cloud.yandex.net/iam/v1/tokens",
    iss: process.env.SERVICE_ACCOUNT_ID,
    iat: now,
    exp: now + 3600,
  };

  jose.JWK.asKey(key, "pem", {
    kid: process.env.KEY_ID,
    alg: "PS256",
  }).then(function (result) {
    jose.JWS.createSign({ format: "compact" }, result)
      .update(JSON.stringify(payload))
      .final()
      .then(function (result) {
        axios({
          method: "post",
          url: "https://iam.api.cloud.yandex.net/iam/v1/tokens",
          data: {
            jwt: result,
          },
        }).then(function (result) {
          axios({
            method: "get",
            url: "https://storage.api.cloud.yandex.net/storage/v1/buckets",
            params: {
              folder_id: process.env.FOLDER_ID,
            },
            headers: {
              Authorization: "Bearer " + result.data.iamToken,
            },
          })
            .then(function (data) {
              console.log("данные " + data.data.buckets[0]);
              res.json(data.data);
            })
            .catch(function (err) {
              console.log(err);
            });
        });
      });
  });
});

module.exports = router;
