const express = require("express");
const { Sequelize, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);
// const { Project } = require("./models")
const path = require("path");
const moment = require("moment"); // Tambahkan moment
const app = express();
const port = 3000;

// Setting template engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

// Static assets
app.use("/src/assests/css", express.static(path.join(__dirname, "src/assests/css")));
app.use("/src/assests/js", express.static(path.join(__dirname, "/src/assests/js")));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: false }));


// Helper untuk menghitung durasi
const hbs = require('hbs');
hbs.registerHelper('duration', function (start_date, end_date) {
  const startDate = moment(start_date);
  const endDate = moment(end_date);
  const duration = moment.duration(endDate.diff(startDate)).asDays();
  return `${Math.floor(duration)} days`;
});
hbs.registerHelper('eq', function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
hbs.handlebars.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


// Routing
app.get('/Home', async (req, res) => {
  try {
    // Ambil semua proyek dari database
    const projectsFromDB = await sequelize.query('SELECT * FROM "Projects"', { type: QueryTypes.SELECT });
    // Parsing JSON string technologies back to array
    projectsFromDB.forEach(project => {
      project.technologies = JSON.parse(project.technologies);
    });

    res.render('index', { projects: projectsFromDB });
  } catch (error) {
    console.error('Error when fetching projects:', error);
    res.status(500).send('Failed to fetch projects');
  }
});

app.get('/addmyproject', (req, res) => res.render('addmyproject'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/updateproject', (req, res) => res.render('updateproject'));

// Route untuk menambahkan proyek baru
app.post('/addmyproject', async (req, res) => {
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  const newProject = {
    name: inputProject,
    start_date: startDate,
    end_date: endDate,
    descriptions: description,
    technologies: JSON.stringify(Array.isArray(technologies) ? technologies : [technologies]),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    // Simpan proyek ke dalam database menggunakan Sequelize
    await sequelize.query(
      `INSERT INTO "Projects" (name, start_date, end_date, descriptions, technologies, "createdAt", "updatedAt") VALUES (:name, :start_date, :end_date, :descriptions, :technologies, :createdAt, :updatedAt)`,
      {
        replacements: newProject,
        type: QueryTypes.INSERT
      }
    );

    // Ambil kembali semua proyek dari database dan perbarui variabel projects
    const projectsFromDB = await sequelize.query('SELECT * FROM "Projects"', { type: QueryTypes.SELECT });
    projectsFromDB.forEach(project => {
      project.technologies = JSON.parse(project.technologies);
    });

    // Redirect ke halaman Home setelah menyimpan proyek
    res.redirect('/Home');
  } catch (error) {
    console.error('Error when adding project:', error);
    res.status(500).send('Failed to add project');
  }
});

// Route untuk menampilkan detail proyek berdasarkan index
app.get('/project/:index', async (req, res) => {
  const { index } = req.params;
  try {
    // Ambil semua proyek dari database
    const projectsFromDB = await sequelize.query('SELECT * FROM "Projects"', { type: QueryTypes.SELECT });
    projectsFromDB.forEach(project => {
      project.technologies = JSON.parse(project.technologies);
    });

    const project = projectsFromDB[index];
    if (project) {
      res.render('projectDetail', { project });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (error) {
    console.error('Error when fetching projects:', error);
    res.status(500).send('Failed to fetch projects');
  }
});

// Route untuk mengupdate proyek
app.get('/updateproject/:index', async (req, res) => {
  const { index } = req.params;
  try {
    // Ambil semua proyek dari database
    const projectsFromDB = await sequelize.query('SELECT * FROM "Projects"', { type: QueryTypes.SELECT });
    projectsFromDB.forEach(project => {
      project.technologies = JSON.parse(project.technologies);
    });

    const project = projectsFromDB[index];
    if (project) {
      res.render('updateProject', { project, projectIndex: index });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (error) {
    console.error('Error when fetching projects:', error);
    res.status(500).send('Failed to fetch projects');
  }
});

app.post('/updateproject/:index', async (req, res) => {
  const { index } = req.params;
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  try {
    const updatedProject = {
      name: inputProject,
      start_date: startDate,
      end_date: endDate,
      descriptions: description,
      technologies: JSON.stringify(Array.isArray(technologies) ? technologies : [technologies]),
      updatedAt: new Date()
    };

    await sequelize.query(
      `UPDATE "Projects" SET name = :name, start_date = :start_date, end_date = :end_date, descriptions = :descriptions, technologies = :technologies, "updatedAt" = :updatedAt WHERE id = :id`,
      {
        replacements: { ...updatedProject, id: index },
        type: QueryTypes.UPDATE
      }
    );

    res.redirect('/Home');
  } catch (error) {
    console.error('Error when updating project:', error);
    res.status(500).send('Failed to update project');
  }
});

// Route untuk menghapus proyek
app.post('/deleteproject/:index', async (req, res) => {
  const { index } = req.params;
  try {


    await sequelize.query(
      `DELETE FROM "Projects" WHERE id = :id`,
      {
        replacements: { id: index },
        type: QueryTypes.DELETE
      }
    );

    res.redirect('/Home');
  } catch (error) {
    console.error('Error when deleting project:', error);
    res.status(500).send('Failed to delete project');
  }
});

app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
