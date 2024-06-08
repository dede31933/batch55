const TestimoniData = [
  {
    image:
      "https://palcomtech.ac.id/wp-content/uploads/2023/10/b982a4d1b35c775113cdda90a9cfe597.png",
    content: "saya pendiri yandex?",
    author: "Mark Zuckerberg",
    rating: 5,
  },
  {
    image:
      "https://infobisnis.id/wp-content/uploads/2023/09/warren_buffett.jpg",
    content: "saya adalah orang terkaya di amerika",
    author: "Warren Buffett",
    rating: 4,
  },
  {
    image:
      "https://bc.ctvnews.ca/content/dam/ctvnews/en/images/2024/5/17/elon-musk-1-6891501-1715964561736.jpg",
    content: "saya yg punya roket",
    author: "Elon Musk",
    rating: 1,
  },
  {
    image:
      "https://awsimages.detik.net.id/visual/2023/12/15/presiden-rusia-vladimir-putin-menghadiri-konferensi-pers-tahunannya-di-moskow-rusia-kamis-14-desember-2023_43.jpeg?w=450&q=90",
    content: "janagn macem macem sya nuklir lohh",
    author: "Putin",
    rating: 2,
  },
  {
    image:
      "https://media.cnn.com/api/v1/images/stellar/prod/121101103247-barack-obama-hedshot.jpg?q=w_1110,c_fill",
    content: "saya suka sate khas indonesia",
    author: "President Barack Obama",
    rating: 5,
  },
];

function html(item) {
  return `
    <div class="testimonial">
        <img src="${item.image}" alt="testimonial" class="profile-testimonial">
            <p class="quote">${item.content}</p>
            <p class="author">- ${item.author}</p>
            <p class="author">${item.rating} <i class="fa-solid fa-star"></i></p>
    </div>`;
}

function allTestimonial() {
  let testimonialHtml = ``;
  TestimoniData.forEach((item) => {
    testimonialHtml += html(item);
  });

  document.getElementById("testimonials").innerHTML = testimonialHtml;
}

allTestimonial();

function filterTestimonials(rating) {
  let testimonialHtml = ``;
  const testimonialFilter = TestimoniData.filter((item) => {
    return item.rating === rating;
  });

  if (testimonialFilter.length === 0) {
    testimonialHtml = `<h1> Data not found!</h1>`;
  } else {
    testimonialFilter.forEach((item) => {
      testimonialHtml += html(item);
    });
  }

  document.getElementById("testimonials").innerHTML = testimonialHtml;
}
