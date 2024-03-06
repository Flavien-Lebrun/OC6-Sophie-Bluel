// Importez les fonctions fetch depuis apiFunctions.js
import { getWorks, getCategories, sendWork, deleteWorkById } from "./apiFunctions.js";

async function loadCategories(categoriesList) {
  const categories = await getCategories(categoriesList);

  // Nous ajoutons pour chaque catégorie, un button dans l'HTML
  const categoriesContainer = document.querySelector(".categories");
  categories.forEach((category) => {
    const buttonElement = document.createElement("button");
    buttonElement.setAttribute("category", category.id);
    buttonElement.textContent = category.name;
    categoriesContainer.appendChild(buttonElement);
  });
}

async function loadWorks(worksList) {
  const works = await getWorks(worksList);

  // Ajouter dynamiquement les éléments du tableau dans l'HTML pour chaque work détecté via une boucle
  const galleryContainer = document.querySelector(".gallery");
  works.forEach((work) => {
    // Créer un élément figure pour chaque work existant et y ajouter un attribut selon sa catégorie
    const figureElement = document.createElement("figure");
    figureElement.setAttribute("category", work.categoryId);

    // Créer un élément img avec une source, un alt ainsi qu'une description visible
    const imgElement = document.createElement("img");
    imgElement.id = work.id;
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
async function getWorksEditMode(worksList) {
  // Récupération du tableau works depuis l'API
  const works = await getWorks(worksList);

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
    deleteImgTrashCan.addEventListener("click", async (event) => {
      try {
        event.preventDefault();
        const id = work.id;
        console.log("l'id avant function est:", id);
        const token = localStorage.getItem("token");

        const response = await deleteWorkById(id, token);

        if (response.ok) {
          console.log("Le travail a bien été supprimé");
          console.log("l'id après function est:", id);
          const galleryContainer = document.querySelector(".gallery");
          galleryContainerEditMode.removeChild(document.getElementById(`#${id}`));
          galleryContainer.removeChild(document.getElementById(`#${id}`));
        } else {
          const data = await response.json();
          console.error(data.message);
        }
      } catch (error) {
        console.error("Une erreur s'est produite lors de l'envoi du travail :", error);
        throw error;
      }
    });

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
          <input type="file" name="image" id="imageInput" multiple="false" accept=".png, .jpeg, .jpg">
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
  
  document.getElementById("fillInPhotosForm").addEventListener("submit", async (event) => {
    console.log("test");
    try {
      event.preventDefault();
      const formData = new FormData();
      const token = localStorage.getItem("token");
      const title = document.getElementById("title").value;
      const categoryId = document.getElementById("categories").value;
      const imageInput = document.getElementById("imageInput").files;
      if (imageInput.length > 0) {
        formData.append("image", imageInput[0]);
        formData.append("title", title);
        formData.append("category", categoryId);
        console.log(formData);

        const response = await sendWork(formData, token);

        if (response.ok) {
          console.log("Le travail a bien été envoyé");
        } else {
          const data = await response.json();
          console.error(data.message);
        }
      } else {
        console.error("Veuillez sélectionner une image.");
      }
    } catch (error) {
      console.error("Une erreur s'est produite lors de l'envoi du travail :", error);
      throw error;
    }
  }); 

  async function getCategoriesInput(categoriesList) {
    const categoryLabelInput = document.getElementById("categories");
    const categories = await getCategories(categoriesList);

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
}

async function main() {
  await loadCategories();
  await loadWorks();
  filterWorks();
  connectionStatus();
}

main();