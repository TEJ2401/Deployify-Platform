const express = require("express");
const axios = require("axios"); // Load environment variables from .env file
const app = express();

const PORT = process.env.PORT || 3000;

// Redirect the user to GitHub's OAuth page to start the authentication process
app.get("/auth/github", (req, res) => {
  const githubAuthUrl = `http://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgithub%2Fcallback&scope=repo%20user&state=random_string_here&allow_signup=true`;
  res.redirect(githubAuthUrl);
});
app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  console.log(code);
  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data;
    console.log(accessToken);
    // // Optionally, use the access token to fetch user information
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken.access_token}`,
        Accept: "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    console.log(accessToken.access_token);

    const githubUser = userResponse.data;
    console.log(githubUser);
    // You can now store the access token and user data in your database

    res.json({
      message: "Authentication successful",
      access_token: accessToken,
      user: githubUser,
    });
  } catch (error) {
    console.error("Error exchanging code for token:");
    res.status(500).send("Authentication failed");
  }
});

// Basic home route
app.get("/", (req, res) => {
  res.send("Welcome to GitHub OAuth integration!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
