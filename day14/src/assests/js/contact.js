function submitData() {
  const inputName = document.getElementById("inputName").value;
  const inputEmail = document.getElementById("inputEmail").value;
  const inputPhone = document.getElementById("inputPhone").value;
  const inputSubject = document.getElementById("inputSubject").value;
  const inputMessage = document.getElementById("inputMessage").value;

  // Perkondisian
  if (inputName === "") {
    alert("Name harus diisi"); // Kondisi 1
  } else if (inputEmail === "") {
    alert("Email Harus Diisi"); // Kondisi 2
  } else if (inputPhone === "") {
    alert("Phone Number tidak boleh kosong"); // Kondisi 3
  } else if (inputSubject === "") {
    alert("Subject tidak boleh kosong"); // Kondisi 4
  } else if (inputMessage === "") {
    alert("Message tidak boleh kosong"); // Kondisi 5
  } else {
    // Ketika semua kondisi sudah terpenuhi
    const myemail = "dedehidayyat57@gmail.com";
    let a = document.createElement("a");
    a.href = `mailto:${myemail}?subject=${inputSubject}&body=Hello my name is ${inputName}, and my number is ${inputPhone}. ${inputMessage}`;
    a.click();
    console.log(
      `Name : ${inputName}\nEmail : ${inputEmail}\nPhone : ${inputPhone}\nSubject : ${inputSubject}\nMessage : ${inputMessage}`
    );
  }
}
