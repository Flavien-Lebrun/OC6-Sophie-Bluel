function login() {
  document.getElementById("loginForm");
  document.addEventListener("submit", async function (event) {
    console.log("Le bouton submit a été utilisé");
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Stockez le token dans localStorage (ou les cookies, selon votre choix)
      localStorage.setItem("token", data.token);
      console.log(
        "Les informations de connexion sont correctes, le token a été stocké dans le stockage local"
      );

      // Redirigez l'utilisateur vers une page protégée ou effectuez d'autres actions nécessaires
      window.location.href = "index.html";
    } else {
      // Gérez les erreurs d'authentification ici
      console.error(data.message);
      // Afficher un message d'erreur
      const formulaireElement = document.getElementById("loginForm");
      afficherMessageErreur(
        formulaireElement,
        "Email ou mot de passe incorrect."
      );
    }
  });
}

// Fonction pour afficher un message d'erreur
function afficherMessageErreur(element, message) {
  const messageErreurElement = document.createElement("div");
  messageErreurElement.classList.add("message-erreur");
  messageErreurElement.textContent = message;
  element.parentNode.appendChild(messageErreurElement);
  document.addEventListener("click", function (event) {
    messageErreurElement.parentNode.removeChild(messageErreurElement);
    document.removeEventListener("click", supprimerMessageErreur);
  });
  // setTimeout(() => {
  //   messageErreurElement.parentNode.removeChild(messageErreurElement);
  // }, 3000);
}

login();

//sophie.bluel@test.tld S0phie //
