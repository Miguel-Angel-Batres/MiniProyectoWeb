const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();

//app.set("view engine", "ejs");
//app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
app.use(express.static("public"));



const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});