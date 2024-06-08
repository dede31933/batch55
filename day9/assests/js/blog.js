function getFullTime(tanggal) {
  const monthList = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const date = tanggal.getDate();
  const month = tanggal.getMonth();
  const year = tanggal.getFullYear();
  let hours = tanggal.getHours();
  let minutes = tanggal.getMinutes();

  if (hours <= 9) {
    hours = "0" + hours;
  }

  if (minutes <= 9) {
    minutes = "0" + minutes;
  }

  return `${date} ${monthList[month]} ${year} ${hours}:${minutes}`;
}

function getDistanceTime(time) {
  const timeNow = new Date().getTime();
  const timePosted = new Date(time).getTime();

  const distance = timeNow - timePosted;

  const distanceSeconds = Math.floor(distance / 1000);
  const distanceMinutes = Math.floor(distance / 1000 / 60);
  const distanceHours = Math.floor(distance / 1000 / 60 / 60);
  const distanceDay = Math.floor(distance / 1000 / 60 / 60 / 24);

  if (distanceDay > 0) {
    return `${distanceDay} Day(s) Ago`;
  } else if (distanceHours > 0) {
    return `${distanceHours} Hour(s) Ago`;
  } else if (distanceMinutes > 0) {
    return `${distanceMinutes} Minute(s) Ago`;
  } else if (distanceSeconds > 0) {
    return `${distanceSeconds} Second(s) Ago`;
  }
}

let dataBlog = [];

function submitBlog(event) {
  event.preventDefault();

  let inputProject = document.getElementById("inputProject").value;
  let inputDate = document.getElementById("inputDate").value;
  let inputDatetime = document.getElementById("inputDatetime").value;
  let inputDescription = document.getElementById("inputDescription").value;
  let inputImage = document.getElementById("inputImage").files;
  let Nodejs = document.getElementById("NodeJs").checked;
  let ReactJs = document.getElementById("ReactJs").checked;
  let NextJs = document.getElementById("NextJs").checked;
  let TypeScript = document.getElementById("TypeScript").checked;

  if (inputProject == "") {
    alert("Please enter the project name.");
    return;
  } else if (inputDate == "") {
    alert("Please enter the date.");
    return;
  } else if (inputDatetime == "") {
    alert("Please enter the datetime.");
    return;
  } else if (inputDescription == "") {
    alert("Please enter the description.");
    return;
  } else if (inputImage.length == 0) {
    alert("Please upload an image.");
    return;
  }

  inputImage = URL.createObjectURL(inputImage[0]);

  const blog = {
    project: inputProject,
    date: inputDate,
    datetime: inputDatetime,
    description: inputDescription,
    image: inputImage,
    postAt: new Date(),
    author: inputDatetime,
    nodejs: Nodejs,
    react: ReactJs,
    next: NextJs,
    TypeScrip: TypeScript,
  };

  dataBlog.push(blog);
  renderBlog();
}

document.getElementById("blogForm").addEventListener("submit", submitBlog);

function renderBlog() {
  document.getElementById("content").innerHTML = "";
  for (let index = 0; index < dataBlog.length; index++) {
    document.getElementById("content").innerHTML += `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <div class="container-card">
        <div class="container-image">
        <a href="blog-detail.html" target="_black"><img src="${dataBlog[index].image}" alt="Image Upload" /></a>
        </div>
        <div class="container-content">
        <h3>${dataBlog[index].project} - ${new Date(dataBlog[index].postAt).getFullYear()}</h3>
          <p class="duration">Duration: ${getDistanceTime(dataBlog[index].postAt)}</p>
          <p class="container-p">${dataBlog[index].description}</p>

          <div class="technologies-a">
            ${dataBlog[index].nodejs ? '<i class="fab fa-node-js"></i>' : ""}
            ${dataBlog[index].react ? '<i class="fab fa-react"></i>' : ""}
            ${dataBlog[index].next ? '<i class="fab fa-js"></i>' : ""}
            ${dataBlog[index].TypeScrip ? '<i class="fa-brands fa-java"></i>' : ""}
          </div>
          <div class="btn-group">
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    `;
  }
}

setInterval(renderBlog, 10000);
