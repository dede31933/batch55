const express = require("express");
// ini ada di node js
const path = require("path");

const app = express();
const port = 3000;

// const data = [];

// app.set
// mendeskripsikan templte engine apa yang dipake
app.set("view engine", "hbs");
// ini memberitahu si templte engine ngambilnya dari folder mana
app.set("views", path.join(__dirname, "src/views"));

// ini untuk assets
app.use("/src/assests/css", express.static(path.join(__dirname, "src/assests/css")));

// middleware -> yang berfungsi sebagai alat memproses inputan dari form (Request)
app.use(express.urlencoded({ extended: false }));

// Routing
app.get("/", home);
app.get("/addmyproject", AddProject);
app.get("/contact", contact);

function home(req, res) {
  res.render("index");
}
function AddProject(req, res) {
  res.render("addmyproject");
}
function contact(req, res) {
  res.render("contact");
}

app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
