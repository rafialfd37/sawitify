async function auth() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/user", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      token: token,
      refer: "AUTH",
    }),
  });

  const result = await response.json();

  if (result.role === "pemanen") {
    window.location.href = `/pemanen.html`;
  } else if (result.role === "admin") {
    window.location.href = `/admin.html`;
  } else if (result.role === "mandor") {
    window.location.href = `/mandor.html`;
  }
}

async function handlerLogin() {
  const usernameInput = document.getElementById("username").value;
  const passwordInput = document.getElementById("password").value;

  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
        refer: "LOGIN",
      }),
    });

    const result = await response.json();

    if (result.success == true) {
      localStorage.setItem("token", result.token);
      window.location.href = `/${result.role}.html`;
    } else {
      alert(result.msg);
    }
  } catch (error) {
    console.error("Gagal POST ke API:", error.message);
    console.log("Gagal: " + error.message);
  }
}

auth();
