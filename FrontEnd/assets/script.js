async function getCategories() {
  // Nous récupérons les catégories depuis l'API
  const categoriesRaw = await fetch("http://localhost:5678/api/categories");
  const categories = await categoriesRaw.json();

  // Nous ajoutons pour chaque catégorie, un button dans l'HTML
  const categoriesContainer = document.querySelector(".categories");
  categories.forEach((category) => {
    const buttonElement = document.createElement("button");
    buttonElement.setAttribute("category", category.id);
    buttonElement.textContent = category.name;
    categoriesContainer.appendChild(buttonElement);
  });
}

async function getWorks() {
  // Récupération du tableau works depuis l'API
  const response = await fetch("http://localhost:5678/api/works");
  const works = await response.json();

  // Ajouter dynamiquement les éléments du tableau dans l'HTML pour chaque work détecté via une boucle
  const galleryContainer = document.querySelector(".gallery");
  works.forEach((work) => {
    // Créer un élément figure pour chaque work existant et y ajouter un attribut selon sa catégorie
    const figureElement = document.createElement("figure");
    figureElement.setAttribute("category", work.categoryId);

    // Créer un élément img avec une source, un alt ainsi qu'une description visible
    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;
    imgElement.alt = work.title;
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.textContent = work.title;

    // Ajoutez les éléments dans leur figure correspondantes
    figureElement.appendChild(imgElement);
    figureElement.appendChild(figcaptionElement);

    // Ajoutez le nouvel élément figure à la div gallery
    galleryContainer.appendChild(figureElement);
  });
}

function filterWorks() {
  // Récupérer l'information des boutons
  const categoryButtons = document.querySelectorAll(".categories button");
  console.log("J'ai récupéré", categoryButtons.length, "catégories");

  // Différencier chaque bouton
  categoryButtons.forEach((button) => {
    button.addEventListener("click", categoryClicked);
  });
}

function categoryClicked(event) {
  // Je récupère la NodeList des buttons de catégories
  const categoryButtons = document.querySelectorAll(".categories button");
  // Je récupère la value correspondante à la catégorie de chaque button
  const categoryValue = event.target.getAttribute("category");

  console.log("Vous avez sélectionné la catégorie :", categoryValue);
  // J'enlève l'attribut selected à tous les buttons
  categoryButtons.forEach((button) => {
    button.removeAttribute("selected");
  });
  // J'ajoute l'attribut selected au button target lors du click
  event.target.setAttribute("selected", true);
  // Je récupère la NodeList de toutes les figures dans la gallery
  const allFigures = document.querySelectorAll(".gallery figure");
  // Pour chacune des figures, je récupère la valeur de son attribut category et l'énonce
  allFigures.forEach((figure) => {
    const figureCategory = figure.getAttribute("category");
    console.log("La catégorie de cette figure est :", figureCategory);
    console.log(categoryValue);

    // Si le bouton "Tous" est sélectionné,
    if (categoryValue == 0 || figureCategory === categoryValue) {
      figure.style.display = "block";
    } else {
      figure.style.display = "none";
    }
  });
}

let preventDefaultEnabled = true;

function connectionStatus() {
  // Je récupère le token d'authentification via le local storage en créant une constante
  const userToken = localStorage.getItem("token");
  console.log("Le token présent dans le localStorage est :", userToken);

  const loginButton = document.getElementById("connectionStatusAnchor");

  // Gestion du bouton "Modifier" en sélectionnant la div vide déjà existante (définie en dehors de la condition pour éviter la répétition)
  const editDiv = document.querySelector(".portfolio__div__edit");

  // Gestion du header
  const header = document.querySelector("header");

  // Si le token est présent, je peux commencer les changements dans l'HTML
  if (userToken) {
    // // Ajoutez la div à la fin du header et augmenter la margin top du header
    // header.appendChild(editDivHeader);
    header.style.marginTop = "75px";

    // Je change l'élément <a> de login en élément <a> de logout
    loginButton.textContent = "logout";
    loginButton.href = "#";

    // Gestion du bouton logout
    const logoutHandler = function (event) {
      console.log("logout");
      event.preventDefault();
      localStorage.removeItem("token");
      loginButton.href = "login.html";

      // Retirer le blocage d'évènement lors du click
      loginButton.removeEventListener("click", logoutHandler);
      preventDefaultEnabled = true;
      connectionStatus();
    };

    loginButton.addEventListener("click", logoutHandler);

    // Masquer la grille des catégories
    const categoriesContainer = document.querySelector(".categories");
    categoriesContainer.style.display = "none";

    header.insertAdjacentHTML(
      `beforeend`,
      `
        <div id="header__editDiv">
          <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
          <p>Mode édition</p>
        </div>`
    );

    document.getElementById("portfolio__div").insertAdjacentHTML(
      `beforeend`,
      `
      <div id="portfolio__div__edit">
        <div id="editorDiv">
          <i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>
          <p>modifier</p>
        </div>
      </div>`
    );

    document.getElementById("editorDiv").addEventListener("click", editPopUp);
  } else {
    console.log("Aucun token n'as été détecté dans le localStorage");
    loginButton.textContent = "login";

    // Afficher à nouveau la grille des catégories
    const categoriesContainer = document.querySelector(".categories");
    categoriesContainer.style.display = "flex";

    // Supprimer la <div> "Mode édition" ainsi que reinitialiser la margin du header
    header.removeChild(document.getElementById("header__editDiv"));
    header.style.marginTop = "50px";

    // Supprimer le bouton modifier s'il était présent
    while (editDiv.firstChild) {
      editDiv.removeChild(editDiv.firstChild);
    }
  }
}

// Fonction pour afficher le Pop up d'édition des photos
function editPopUp() {
  console.log("overlay");
  const main = document.querySelector("main");
  main.insertAdjacentHTML(
    `beforeend`,
    `
    <div id="edit__divOverlay"></div>
    <div id="editForm">
      <i id="exitEditModeCross" class="fa-solid fa-xmark" aria-hidden="true"></i>
      <h3>Galerie photo</h3>
      <div class="galleryEditor gallery"></div>
      <span>
        <input id="submitPhotoInput" type="submit" value="Ajouter une photo">
      </span>
    </div>`
  );

  const exitEditMode = function (event) {
    main.removeChild(document.getElementById(`edit__divOverlay`));
    main.removeChild(document.getElementById(`editForm`));
  };

  const exitEditModeCross = document.getElementById(`exitEditModeCross`);
  exitEditModeCross.addEventListener("click", exitEditMode);
  const submitPhotoInput = document.getElementById("submitPhotoInput");
  submitPhotoInput.addEventListener("click", addingPhotosMode);

  getWorksEditMode();
}

// Fonction pour récupérer et afficher les images de la banque de données
async function getWorksEditMode() {
  // Récupération du tableau works depuis l'API
  const response = await fetch("http://localhost:5678/api/works");
  const works = await response.json();

  // Ajouter dynamiquement les éléments du tableau dans l'HTML pour chaque work détecté via une boucle
  const galleryContainerEditMode = document.querySelector(".galleryEditor");
  works.forEach((work) => {
    // Créer un élément figure pour chaque work existant et y ajouter un attribut selon sa catégorie
    const figureElement = document.createElement("figure");
    figureElement.setAttribute("id", work.id);

    // Créer un élément img avec une source, un alt ainsi qu'une description visible
    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;

    const anchorDeleteImgTrashCan = document.createElement("a");

    const deleteImgTrashCan = document.createElement("i");
    deleteImgTrashCan.className = "fa-solid fa-trash-can";

    // Ajoutez les éléments dans leur figure correspondantes
    figureElement.appendChild(imgElement);
    figureElement.appendChild(anchorDeleteImgTrashCan);
    anchorDeleteImgTrashCan.appendChild(deleteImgTrashCan);

    // Ajoutez le nouvel élément figure à la div gallery
    galleryContainerEditMode.appendChild(figureElement);
  });
}

// Fonction pour passer au mode d'ajout des photos
function addingPhotosMode() {
  const main = document.querySelector("main");

  main.insertAdjacentHTML(
    `beforeend`,
    `
    <div id="addingPhotosForm">
      <div id="navigationButtonsAddingPhotosDiv">
        <i id="returnToEditModeArrow" class="fa-solid fa-arrow-left" aria-hidden="true"></i>
        <i id="exitAddingPhotosModeCross" class="fa-solid fa-xmark" aria-hidden="true"></i>
      </div>
      <h3>Ajout photo</h3>
      <form id="fillInPhotosForm" action="http://localhost:5678/api/works" method="post" enctype="multipart/form-data">
        <div id="previewPictureLabel">
          <i class="fa-regular fa-image" aria-hidden="true"></i>
          <input type="file" name="image" id="imageInput" accept="image/*" multiple="false">
        </div>
        <label for="title">Titre</label><input type="text" name="title" id="title">
        <label for="category">Catégorie</label>
        <select id="categories"></select>
        <span>
          <input type="submit" value="Valider">
        </span>
      </form>
    </div>`
  );

  function addingWorks() {
    document.getElementById("addingPhotosForm");
    document.addEventListener("submit", async function (event) {
      console.log("Un travail a été envoyé");
      event.preventDefault();
      const token = localStorage.getItem("token");
      // Récupération du tableau works depuis l'API
      const worksResponse = await fetch("http://localhost:5678/api/works");
      const works = await worksResponse.json();
      const id = works.length + 1;
      const title = document.getElementById("title").value;
      const imageInput = document.getElementById("imageInput");
      const selectedFiles = imageInput.files;
      const firstFile = selectedFiles[0];
      const imageUrl = URL.createObjectURL(firstFile);
      const categoryId = document.getElementById("categories").value;
      const userId = parseInt(localStorage.getItem("userId"));
      console.log(id, title, imageUrl, categoryId, userId);
      console.log("Token:", token);
      const response = fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ${token}",
        },
        body: JSON.stringify({
          id: id,
          title: title,
          imageUrl: imageUrl,
          categoryId: categoryId,
          userId: userId,
        }),
      });
      URL.revokeObjectURL(imageUrl);

      if (response.ok) {
        console.log("Le travail a bien été envoyé");
      } else {
        console.log("marche pas ta merde");
      }
    });
  }

  async function getCategoriesInput() {
    const categoryLabelInput = document.getElementById("categories");
    const categoriesRaw = await fetch("http://localhost:5678/api/categories");
    const categories = await categoriesRaw.json();

    // Nous ajoutons pour chaque catégorie, un select dans l'input
    categories.forEach((category) => {
      const categorySelect = document.createElement("option");
      categorySelect.setAttribute("value", category.id);
      categorySelect.textContent = category.name;
      categoryLabelInput.appendChild(categorySelect);
    });
    categoryLabelInput.selectedIndex = -1;
  }

  // Fonction pour revenir au menu précédent
  const returnToEditMode = function (event) {
    main.removeChild(document.getElementById(`addingPhotosForm`));
  };

  // Fonction pour quitter le menu d'édition entièrement
  const exitAddingPhotosMode = function (event) {
    main.removeChild(document.getElementById(`edit__divOverlay`));
    main.removeChild(document.getElementById(`editForm`));
    main.removeChild(document.getElementById(`addingPhotosForm`));
  };

  const returnToEditModeArrow = document.getElementById(
    "returnToEditModeArrow"
  );
  const exitAddingPhotosModeCross = document.getElementById(
    "exitAddingPhotosModeCross"
  );
  returnToEditModeArrow.addEventListener("click", returnToEditMode);
  exitAddingPhotosModeCross.addEventListener("click", exitAddingPhotosMode);

  getCategoriesInput();
  addingWorks();
}

async function main() {
  await getCategories();
  await getWorks();
  filterWorks();
  await connectionStatus();
}

main();
