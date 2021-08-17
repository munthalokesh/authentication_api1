const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "userData.db");
app.use(express.json());
let db = null;
const bcrypt = require("bcrypt");
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      const registerQuery = `INSERT INTO user (username, name, password, gender, location)
      VALUES(
          "${username}",
          "${name}",
          "${hashPassword}",
          "${gender}",
          "${location}"
      );`;
      await db.run(registerQuery);
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

//login api

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    const isPasswdCorrect = await bcrypt.compare(password, dbUser.password);
    if (isPasswdCorrect === true) {
      response.send("Login success");
    } else {
      response.status = 400;
      response.send("Invalid password");
    }
  }
});

//update password api
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  isOldPasswordCorrect = await bcrypt.compare(oldPassword, dbUser.password);
  if (isOldPasswordCorrect === true) {
    if (newPassword.length < 5) {
      response.status = 400;
      response.send("Password is too short");
    } else {
      const hashNewPassword = await bcrypt.hash(newPassword, 10);
      const updatePasswordQuery = `UPDATE user SET
        password="${hashNewPassword}"
        WHERE username="${username}";`;
      await db.run(updatePasswordQuery);
      response.send("Password updated");
    }
  } else {
    response.status = 400;
    response.send("Invalid current password");
  }
});

module.exports = app;
