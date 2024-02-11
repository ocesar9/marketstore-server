const resend = require("resend");
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");


const app = express();
const resendy = new resend.Resend("re_KsfPs2Aa_5gCQsCfjSGxHYwUFDyEHqod7");

app.use(express.json());
app.use(cors());

let users = [];

app.get('/users', (req, res) => {
  return res.json(users);
})

app.post('/users', async(req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = {email: req.body.email, password: hashedPassword}
      users.push(user);
      res.status(201).json({message: 'User created successfully!'})
    } catch (error) {
      res.status(500).json({message: error.message})
    }
});

app.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { email: req.body.email, password: hashedPassword };
    users.push(user);
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.email === req.body.email);
  if(user){
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        return res.status(200).json({ message: "Login successful!" });
      }else {
        return res.status(500).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "User not found" });
    }
  }
});

app.delete("/users", (req, res) => {
  const indexOfUserEmail = users.filter(
    (user) => user.email === req.query.email
  );
  if (indexOfUserEmail.length > 0) {
    users = users.filter((user) => user.email !== req.query.email);
    return res.status(200).json({ message: "User deleted" });
  } else {
    return res.status(400).json({ message: "User not found" });
  }
});

app.post("/mail/send", async (req, res) => {
  try {
    const { data, error } = await resendy.emails.send({
      from: req.body.emailFrom,
      to: req.body.emailTo,
      subject: req.body.subject,
      html: req.body.html,
    });

    if (error) {
      return res.status(400).json(error);
    } else {
      res.status(200).json(data);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port);
