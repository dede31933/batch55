const express = require("express");
const { Sequelize, QueryTypes, DataTypes } = require("sequelize");
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);
const path = require("path");
const moment = require("moment");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const app = express();
const port = 3000;

// Define Sequelize models
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  descriptions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  technologies: {
    type: DataTypes.JSONB,
    allowNull: false
  }
});

// Setting template engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

// Static assets
app.use("/src/assests/css", express.static(path.join(__dirname, "src/assests/css")));
app.use("/src/assests/js", express.static(path.join(__dirname, "/src/assests/js")));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(
  session({
    name: "data",
    secret: "rahasiabgtcui",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Flash messages setup
app.use(flash());

// Helper untuk menghitung durasi
const hbs = require("hbs");
hbs.registerHelper("duration", function (start_date, end_date) {
  const startDate = moment(start_date);
  const endDate = moment(end_date);
  const duration = moment.duration(endDate.diff(startDate)).asDays();
  return `${Math.floor(duration)} days`;
});
hbs.registerHelper("eq", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
hbs.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Routing
app.get("/Home", async (req, res) => {
  try {
    // Ambil semua proyek dari database
    const projectsFromDB = await Project.findAll();
    const formattedData = projectsFromDB.map(item => ({
      ...item.toJSON(), // Convert Sequelize model instance to plain JSON object
      technologies: JSON.parse(item.technologies) // Convert 'technologies' to array
    }));
    res.render("index", { projects: formattedData, isLogin: req.session.isLogin, user: req.session.user });
  } catch (error) {
    console.error("Error when fetching projects:", error);
    res.status(500).send("Failed to fetch projects");
  }
});

app.get("/addmyproject", (req, res) => res.render("addmyproject"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/updateproject", (req, res) => res.render("updateproject"));

// Login page
app.get("/login", loginView);
app.post("/login", login);

// Register page
app.get("/register", registerView);
app.post("/register", register);

// Logout route
app.get("/logout", logout);

// Route untuk menambahkan proyek baru
app.post("/addmyproject", async (req, res) => {
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  const newProject = {
    name: inputProject,
    start_date: startDate,
    end_date: endDate,
    descriptions: description,
    technologies: Array.isArray(technologies) ? technologies : [technologies],//JSON.stringify(Array.isArray(technologies) ? technologies : [technologies]),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    // Simpan proyek ke dalam database menggunakan Sequelize
    await Project.create(newProject);

    // Redirect ke halaman Home setelah menyimpan proyek
    res.redirect("/Home");
  } catch (error) {
    console.error("Error when adding project:", error);
    res.status(500).send("Failed to add project");
  }
});

// Route untuk menampilkan detail proyek berdasarkan index
app.get("/project/:index", async (req, res) => {
  const { index } = req.params;
  try {
    const project = await Project.findByPk(index);
    if (project) {
      project.technologies = JSON.parse(project.technologies)
      res.render("projectDetail", { project });
    } else {
      res.status(404).send("Project not found");
    }
  } catch (error) {
    console.error("Error when fetching projects:", error);
    res.status(500).send("Failed to fetch projects");
  }
});

// Route untuk mengupdate proyek
app.get("/updateproject/:index", async (req, res) => {
  const { index } = req.params;
  try {
    const project = await Project.findByPk(index);
    if (project) {
      res.render("updateProject", { project, projectIndex: index });
    } else {
      res.status(404).send("Project not found");
    }
  } catch (error) {
    console.error("Error when fetching projects:", error);
    res.status(500).send("Failed to fetch projects");
  }
});

app.post("/updateproject/:index", async (req, res) => {
  const { index } = req.params;
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  try {
    const updatedProject = {
      name: inputProject,
      start_date: startDate,
      end_date: endDate,
      descriptions: description,
      technologies: Array.isArray(technologies) ? technologies : [technologies],//JSON.stringify(Array.isArray(technologies) ? technologies : [technologies]),
      updatedAt: new Date(),
    };

    await Project.update(updatedProject, { where: { id: index } });

    res.redirect("/Home");
  } catch (error) {
    console.error("Error when updating project:", error);
    res.status(500).send("Failed to update project");
  }
});

// Route untuk menghapus proyek
app.post("/deleteproject/:index", async (req, res) => {
  const { index } = req.params;
  try {
    await Project.destroy({ where: { id: index } });
    res.redirect("/Home");
  } catch (error) {
    console.error("Error when deleting project:", error);
    res.status(500).send("Failed to delete project");
  }
});

// Fungsi untuk render view login
function loginView(req, res) {
  res.render("login-form");
}

// Fungsi untuk login user
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      req.flash("danger", "Login Failed: Email is wrong!");
      return res.redirect("/login");
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        req.flash("danger", "Login Failed: Internal Server Error");
        return res.redirect("/login");
      }

      if (!result) {
        req.flash("danger", "Login Failed: Password is wrong!");
        return res.redirect("/login");
      }

      req.flash("success", "Login Success!");
      req.session.isLogin = true;
      req.session.user = {
        name: user.name,
        email: user.email,
      };

      res.redirect("/home");
    });
  } catch (error) {
    console.error("Error when finding user:", error);
    req.flash("danger", "Login Failed: Internal Server Error");
    res.redirect("/login");
  }
}

// Fungsi untuk render view register
function registerView(req, res) {
  res.render("register-form");
}

// Fungsi untuk registrasi user
async function register(req, res) {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      req.flash("danger", "Register Failed: Email Already Used!");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    req.flash("success", "Register Success!");
    res.redirect("/login");
  } catch (error) {
    console.error("Error when registering user:", error);
    req.flash("danger", "Register Failed: Internal Server Error");
    res.redirect("/register");
  }
}

// Fungsi untuk logout
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
}

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
