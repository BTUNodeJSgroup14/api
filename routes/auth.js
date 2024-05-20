const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();


// Hardcoded user for simplicity
const user = {
  id: 1,
  username: 'test',
  password: bcrypt.hashSync('test', 8) // Hash the password
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && bcrypt.compareSync(password, user.password)) {
    // Create a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token to the client
    res.json({ token });
  } else {
    res.status(401).send('Username or password is incorrect');
  }
});

module.exports = router;
