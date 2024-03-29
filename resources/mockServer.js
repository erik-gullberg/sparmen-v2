const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());

app.get("/search", (req, res) => {
  const q = req.query.q;
  res.send({
    text: `You searched for: ${q}`,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
