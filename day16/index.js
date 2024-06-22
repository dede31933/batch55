const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config/config.json");
const sequelize = new Sequelize(config.development);
const path = require("path");
const moment = require("moment");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const upload = require("./src/middleware/uploadFile");
const app = express();
const port = 3000;

// Definisikan model Sequelize
const User = require("./models/user")(sequelize, DataTypes);
const Project = require("./models/project")(sequelize, DataTypes);

// Setting template engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

// Static assets
app.use("/src/assests/css", express.static(path.join(__dirname, "src/assests/css")));
app.use("/src/assests/js", express.static(path.join(__dirname, "src/assests/js")));
app.use("/src/uploads", express.static(path.join(__dirname, "src/uploads")));

// Middleware untuk parsing form data
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

// Middleware untuk mengecek login
function checkAuth(req, res, next) {
  if (req.session.isLogin) {
    next();
  } else {
    req.flash("danger", "You need to login first.");
    res.redirect("/login");
  }
}

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
    console.error("Error saat mengambil proyek:", error);
    res.status(500).send("Gagal mengambil proyek");
  }
});

app.get("/addmyproject", checkAuth, (req, res) => res.render("addmyproject"));
app.get("/contact", (req, res) => res.render("contact"));

// Halaman login
app.get("/login", loginView);
app.post("/login", login);

// Halaman register
app.get("/register", registerView);
app.post("/register", register);

// Rute logout
app.get("/logout", logout);

// Rute untuk menambahkan proyek baru
app.post("/addmyproject", upload, checkAuth, async (req, res) => {
  const { inputProject, startDate, endDate, description, image, technologies } = req.body;
  const userId = req.session.user.id; // Ambil id pengguna dari sesi

  const newProject = {
    name: inputProject,
    start_date: startDate,
    end_date: endDate,
    image: image,
    descriptions: description,
    technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : JSON.stringify([technologies]), // Ubah menjadi string sebelum disimpan
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: userId, // Simpan userId dari sesi
  };


  // Cek jika file diupload
  if (req.file) {
    newProject.image = `/src/uploads/${req.file.filename}`;
    console.log("Image path:", newProject.image); // Log untuk debug
  }

  try {
    // Simpan proyek ke database menggunakan Sequelize
    await Project.create(newProject);

    // Redirect ke halaman Home setelah menyimpan proyek
    res.redirect("/Home");
  } catch (error) {
    console.error("Error saat menambahkan proyek:", error);
    res.status(500).send("Gagal menambahkan proyek");
  }
});

// Rute untuk menampilkan detail proyek berdasarkan index
app.get("/project/:index", async (req, res) => {
  const { index } = req.params;
  try {
    const project = await Project.findByPk(index);
    if (project) {
      project.technologies = JSON.parse(project.technologies);
      res.render("projectDetail", { project });
    } else {
      res.status(404).send("Project not found");
    }
  } catch (error) {
    console.error("Error saat mengambil proyek:", error);
    res.status(500).send("Gagal mengambil proyek");
  }
});

// Rute untuk mengupdate proyek
app.get("/updateproject/:index", checkAuth, async (req, res) => {
  const { index } = req.params;
  try {
    const project = await Project.findByPk(index);
    if (project) {
      // Pastikan hanya pemilik proyek yang bisa mengedit
      if (project.userId !== req.session.user.id) {
        req.flash("danger", "You are not authorized to edit this project.");
        return res.redirect("/Home");
      }
      res.render("updateProject", { project, projectIndex: index });
    } else {
      res.status(404).send("Project not found");
    }
  } catch (error) {
    console.error("Error saat mengambil proyek:", error);
    res.status(500).send("Gagal mengambil proyek");
  }
});

// Rute untuk mengupdate proyek (POST)
app.post("/updateproject/:index", upload, checkAuth, async (req, res) => {
  const { index } = req.params;
  const { inputProject, startDate, endDate, description, technologies } = req.body;
  try {
    // Pastikan hanya pemilik proyek yang bisa mengupdate
    const project = await Project.findByPk(index);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    if (project.userId !== req.session.user.id) {
      req.flash("danger", "You are not authorized to update this project.");
      return res.redirect("/Home");
    }

    const updatedProject = {
      name: inputProject,
      start_date: startDate,
      end_date: endDate,
      descriptions: description,
      technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : JSON.stringify([technologies]), // Ubah menjadi string sebelum disimpan
      updatedAt: new Date(),
    };

    // Cek jika file diupload
    if (req.file) {
      updatedProject.image = `/src/uploads/${req.file.filename}`;
      console.log("Updated image path:", updatedProject.image); // Log untuk debug
    }

    await Project.update(updatedProject, { where: { id: index } });

    res.redirect("/Home");
  } catch (error) {
    console.error("Error saat mengupdate proyek:", error);
    res.status(500).send("Gagal mengupdate proyek");
  }
});


// Rute untuk menghapus proyek
app.post("/deleteproject/:index", checkAuth, async (req, res) => {
  const { index } = req.params;
  try {
    // Pastikan hanya pemilik proyek yang bisa menghapus
    const project = await Project.findByPk(index);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    if (project.userId !== req.session.user.id) {
      req.flash("danger", "You are not authorized to delete this project.");
      return res.redirect("/Home");
    }

    await Project.destroy({ where: { id: index } });
    res.redirect("/Home");
  } catch (error) {
    console.error("Error saat menghapus proyek:", error);
    res.status(500).send("Gagal menghapus proyek");
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
        id: user.id // Sertakan id pengguna di sesi
      };

      res.redirect("/Home");
    });
  } catch (error) {
    console.error("Error saat mencari user:", error);
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
    console.error("Error saat registrasi user:", error);
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
