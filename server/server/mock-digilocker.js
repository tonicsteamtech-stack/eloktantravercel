const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const MOCK_CODE = "mock_auth_code_123";
const MOCK_TOKEN = "mock_access_token_456";

app.post('/auth/token', (req, res) => {
  const { code } = req.body;
  if (code === MOCK_CODE) {
    res.json({
      access_token: MOCK_TOKEN,
      expires_in: 3600
    });
  } else {
    res.status(401).json({ error: "Invalid auth code" });
  }
});

app.get('/auth/userinfo', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${MOCK_TOKEN}`) {
    res.json({
      name: "Sarthak Mangalwedhekar",
      voterId: "MH/123/456789",
      dob: "2000-01-01",
      verified: true
    });
  } else {
    res.status(401).json({ error: "Invalid or missing token" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Mock DigiLocker Server running on http://localhost:${PORT}`);
});
