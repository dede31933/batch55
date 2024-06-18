const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

const projects = [];

// Setting template engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

// Static assets
app.use("/src/assests/css", express.static(path.join(__dirname, "src/assests/css")));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: false }));

// Routing
app.get('/Home', (req, res) => res.render('index', { projects }));
app.get('/addmyproject', (req, res) => res.render('addmyproject'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/updateproject', (req, res) => res.render('updateproject'));

// Route untuk menambahkan proyek baru
app.post('/addmyproject', (req, res) => {
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  const newProject = {
    inputProject,
    startDate,
    endDate,
    description,
    technologies: Array.isArray(technologies) ? technologies : [technologies]
  };
  console.log(newProject);
  projects.push(newProject);
  res.redirect('/Home');
});

// Route untuk menampilkan detail proyek berdasarkan index
app.get('/project/:index', (req, res) => {
  const { index } = req.params;
  const project = projects[index];
  if (project) {
    res.render('projectDetail', { project });
  } else {
    res.status(404).send('Project not found');
  }
});


// Route untuk mengupdate proyek
app.get('/updateproject/:index', (req, res) => {
  const { index } = req.params;
  const project = projects[index];
  if (project) {
    res.render('updateProject', { project, projectIndex: index });
  } else {
    res.status(404).send('Project not found');
  }
});

app.post('/updateproject/:index', (req, res) => {
  const { index } = req.params;
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  projects[index] = {
    inputProject,
    startDate,
    endDate,
    description,
    technologies: Array.isArray(technologies) ? technologies : [technologies]
  };
  res.redirect('/Home');
});


// Route untuk menghapus proyek
app.post('/deleteproject/:index', (req, res) => {
  const { index } = req.params;
  projects.splice(index, 1);
  res.redirect('/Home');
});

app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});

// Debug log
// console.log("Received data:", req.body);
// Menampilkan data inputan ke terminal