export async function login() {
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;
    loadingMessage.style.display = "block";
  
    const response = await fetch('http://localhost:9000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password })
    });
    
    const result = await response.json();
  
    if (result.success && result.redirectUrl) {
      loadingMessage.style.display = "none";
      window.location.href = result.redirectUrl; 
    }else{
      loadingMessage.style.display = "none";
      alert("Usuario o Contraseña incorrecto")
    }
}
export async function addData() {
  const name = document.getElementById("nombre").value;
  const photo = document.getElementById("photo").files[0];
  const loadingMessage = document.getElementById("loadingMessage");
  
  loadingMessage.style.display = "block";

  const formData = new FormData();
  formData.append("name", name);
  formData.append("photo", photo);

  const response = await fetch('http://localhost:9000/posthdv', {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (data.success) {
    window.location.href = data.redirectUrl;
    console.log("Upload Response:", data);
  } else {
    alert(`Error: ${data.message || "Algo Pasó"}`);
    loadingMessage.style.display = "none";
  }
}
export function generatePDF() {
  window.print();
}
export async function addEva() {
  const professor = document.getElementById("nameDisplay2").textContent;
  const course = document.getElementById("courseE").value;
  const question1 = document.getElementById("slider").value;
  const question2 = document.getElementById("slider2").value;
  const question3 = document.getElementById("slider3").value;
  const question4 = document.getElementById("slider4").value;
  const question5 = document.getElementById("slider5").value;
  const question6 = document.getElementById("slider6").value;
  const question7 = document.getElementById("slider7").value;
  const question8 = document.getElementById("slider8").value;
  const question9 = document.getElementById("slider9").value;
  const question10 = document.getElementById("slider10").value;
  const comment = document.getElementById("obser").value; 

  const requestBody = {
    professor,
    course,
    question1,
    question2,
    question3,
    question4,
    question5,
    question6,
    question7,
    question8,
    question9,
    question10,
    comment
  };

  const response = await fetch('http://localhost:9000/postEva', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  if (data.success) {
    window.location.href = data.redirectUrl;
    console.log("Upload Response:", data);
  } else {
    alert(data.message);
  }
}
export async function createPage(){
  try {
    const response = await fetch('http://localhost:9000/cDocente', { 
      method: 'POST',
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = data.redirectUrl;
    } else {
      alert("Access denied.");
    }
  } catch (error) {
    console.error("Error redirecting:", error);
  }
}
export async function evaPage(){
  try {
    const response = await fetch('http://localhost:9000/rPrivate', { 
      method: 'POST',
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = data.redirectUrl;
    } else {
      alert("Access denied.");
    }
  } catch (error) {
    console.error("Error redirecting:", error);
  }
}
async function rePage(name){
  try {
      const response = await fetch(`http://localhost:9000/rPage?name=${encodeURIComponent(name)}`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json',}
      });

      const data = await response.json();
      if (data.success) {
          window.location.href = data.redirectUrl;
      } else {
          alert("Access denied.");
      }
  } catch (error) {
      console.error("Error redirecting:", error);
  }
}
window.rePage = rePage;
