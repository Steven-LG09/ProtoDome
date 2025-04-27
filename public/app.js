export async function login() {
  const user = document.getElementById("user").value;
  const password = document.getElementById("password").value;
  const firstLetter = user.charAt(0).toLowerCase();
  loadingMessage.style.display = "block";

  if (firstLetter !== 'd') {
    const response = await fetch('https://protodome.onrender.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user,
        password
      })
    });
    const result = await response.json();

    if (result.success && result.redirectUrl) {
      loadingMessage.style.display = "none";
      window.location.href = result.redirectUrl;
    } else {
      loadingMessage.style.display = "none";
      alert("Usuario o Contraseña incorrecto")
    }
  } else {
    const response = await fetch(`https://protodome.onrender.com/login2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user,
        password
      })
    });
    const result = await response.json();

    if (result.success && result.redirectUrl) {
      loadingMessage.style.display = "none";
      window.location.href = result.redirectUrl;
    } else {
      loadingMessage.style.display = "none";
      alert("Usuario o Contraseña incorrecto")
    }
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

  const response = await fetch('https://protodome.onrender.com/posthdv', {
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

  const response = await fetch('https://protodome.onrender.com/postEva', {
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
export async function createPage() {
  try {
    const response = await fetch('https://protodome.onrender.com/cDocente', {
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
export async function evaPage() {
  try {
    const response = await fetch('https://protodome.onrender.com/rPrivate', {
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
async function rePage(name) {
  try {
    const response = await fetch(`https://protodome.onrender.com/rPage?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
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

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const loadingMessage = document.getElementById("loadingMessage");

  const pages = {
    userCreation: () => {
      const creserButton1 = document.getElementById("createUser");

      fetch('https://protodome.onrender.com/count3', {
          method: "GET",
        })
        .then(response => response.json())
        .then(data => {
          document.getElementById("docCount").innerText = data.count;
        })
        .catch(error => {
          console.error("Error fetching document count:", error);
          document.getElementById("docCount").innerText = "Error";
        });

      if (creserButton1) creserButton1.addEventListener("click", async () => {
        const users = parseInt(document.getElementById("newUsers").value);
        const academic = document.getElementById("courseA").value;

        if (isNaN(users) || users <= 0) {
          alert("❌ Ingresa un número válido de usuarios (mayor que 0)");
          return;
        }

        if (!academic) {
          alert("❌ Ingresa un nombre de curso académico");
          return;
        }
        loadingMessage.style.display = "block";

        const response = await fetch("https://protodome.onrender.com/addUsers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            users,
            academic,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          const createdUsers = result.createdUsers;

          let message = "✅ Usuarios creados:\n\n";
          let fileContent = "Usuarios creados:\n\n";
    
          createdUsers.forEach(({ user, password }) => {
            const line = `👤 Usuario: ${user} | 🔑 Contraseña: ${password}\n`;
            message += line;
            fileContent += `Usuario: ${user} | Contraseña: ${password}\n`;
          });

          alert(message);

          const blob = new Blob([fileContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "usuarios_creados.txt";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          document.getElementById("newUsers").value = "";
          loadingMessage.style.display = "none";
          location.reload();
        } else {
          alert(`❌ Error: ${result.error}`);
        }

      })
    }
  };
  if (pages[page]) pages[page]();
});