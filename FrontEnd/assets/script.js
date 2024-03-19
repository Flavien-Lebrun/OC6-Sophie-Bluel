// Importez les fonctions fetch depuis apiFunctions.js
import { getWorks, getCategories, sendWork, deleteWorkById, getLastWork } from "./apiFunctions.js";

async function loadCategories(categoriesList) {
  const categories = await getCategories(categoriesList);

  // Nous ajoutons pour chaque catégorie, un button dans l'HTML
  const categoriesContainer = document.querySelector(".categories");
  categoriesContainer.insertAdjacentHTML(
    `beforeend`,
    `<button category="0" selected="true">Tous</button>`
  );
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
    figureElement.classList = `id-${work.id}`;

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

async function loadLastWork() {
  const works = await getLastWork();
  const galleryContainer = document.querySelector(".gallery");

  const lastWork = works[works.length - 1]; // Récupérer le dernier élément de la liste

  const lastFigureElement = document.createElement("figure");
  lastFigureElement.setAttribute("category", lastWork.categoryId);
  lastFigureElement.classList = `id-${lastWork.id}`;

  const imgElement = document.createElement("img");
  imgElement.src = lastWork.imageUrl;
  imgElement.alt = lastWork.title;

  const figcaptionElement = document.createElement("figcaption");
  figcaptionElement.textContent = lastWork.title;

  lastFigureElement.appendChild(imgElement);
  lastFigureElement.appendChild(figcaptionElement);

  galleryContainer.appendChild(lastFigureElement);

  const galleryContainerEditMode = document.querySelector(".galleryEditor");
  works.forEach((work) => {
    // Créer un élément figure pour chaque work existant et y ajouter un attribut selon sa catégorie
    const lastFigureElement = document.createElement("figure");
    lastFigureElement.classList = `id-${work.id}`;

    // Créer un élément img avec une source, un alt ainsi qu'une description visible
    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;

    const anchorDeleteImgTrashCan = document.createElement("a");

    const deleteImgTrashCan = document.createElement("i");
    deleteImgTrashCan.className = "fa-solid fa-trash-can";
    deleteImgTrashCan.addEventListener("click", async (event) => {
      event.preventDefault();
      const id = work.id;
      const token = localStorage.getItem("token");

      const response = await deleteWorkById(id, token);

      if (response.ok) {
        const workToDelete = document.querySelectorAll(`.id-${id}`);
        workToDelete.forEach(figure => {
          figure.remove();
        });
      } else {
        console.error(response.status);
      }
    });

    // Ajoutez les éléments dans leur figure correspondantes
    lastFigureElement.appendChild(imgElement);
    lastFigureElement.appendChild(anchorDeleteImgTrashCan);
    anchorDeleteImgTrashCan.appendChild(deleteImgTrashCan);

    // Ajoutez le nouvel élément figure à la div gallery
    galleryContainerEditMode.appendChild(lastFigureElement);
  });
}

function filterWorks() {
  // Récupérer l'information des boutons
  const categoriesContainer = document.querySelector(".categories");
  categoriesContainer.addEventListener("click", categoryClicked);
}

function categoryClicked(event) {
  if (event.target.tagName === 'BUTTON') {
    // Je récupère la NodeList des buttons de catégories
    const categoryButtons = document.querySelectorAll(".categories button");
    // Je récupère la value correspondante à la catégorie de chaque button
    const categoryValue = event.target.getAttribute("category");

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

      // Si le bouton "Tous" est sélectionné,
      if (categoryValue == 0 || figureCategory === categoryValue) {
        figure.style.display = "block";
      } else {
        figure.style.display = "none";
      }
    });
  } else {
    return
  }
}

let preventDefaultEnabled = true;

function connectionStatus() {
  // Je récupère le token d'authentification via le local storage en créant une constante
  const userToken = localStorage.getItem("token");
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
      event.preventDefault();
      localStorage.removeItem("token");
      loginButton.href = "login.html";

      // Retirer le blocage d'évènement lors du click
      loginButton.removeEventListener("click", logoutHandler);
      preventDefaultEnabled = true;
      loginButton.textContent = "login";

      // Afficher à nouveau la grille des catégories
      const categoriesContainer = document.querySelector(".categories");
      categoriesContainer.style.display = "flex";

      // Supprimer la <div> "Mode édition" ainsi que reinitialiser la margin du header
      header.removeChild(document.getElementById("header__editDiv"));
      header.style.marginTop = "50px";
      (document.getElementById("portfolio__div")).removeChild(document.getElementById("portfolio__div__edit"));
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

    const editorDiv = document.getElementById("editorDiv");
    editorDiv.addEventListener("click", editPopUp);
  } else {
    return
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

  document.getElementById(`edit__divOverlay`).addEventListener(`click`, exitEditMode);
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
    figureElement.classList.add(`id-${work.id}`);

    // Créer un élément img avec une source, un alt ainsi qu'une description visible
    const imgElement = document.createElement("img");
    imgElement.src = work.imageUrl;

    const anchorDeleteImgTrashCan = document.createElement("a");

    const deleteImgTrashCan = document.createElement("i");
    deleteImgTrashCan.className = "fa-solid fa-trash-can";
    deleteImgTrashCan.addEventListener("click", async (event) => {
      event.preventDefault();
      const id = work.id;
      const token = localStorage.getItem("token");

      const response = await deleteWorkById(id, token);

      if (response.ok) {
        const workToDelete = document.querySelectorAll(`.id-${id}`);
        workToDelete.forEach(figure => {
          figure.remove();
        });
      } else {
        if (response.status === 401) {
          console.error("Une erreur s'est produite lors de l'envoi du travail :", response.status);

          deleteImgTrashCan.style.backgroundColor = "red";
          setTimeout(() => {
            deleteImgTrashCan.style.backgroundColor = "black";
          }, 1000);
          const errorButton = document.getElementById("submitPhotoInput");
          errorButton.style.backgroundColor = "red";
          errorButton.style.width = "340px";
          errorButton.value = "Token erroné, reconnectez-vous";
        } else {
          console.error("Une erreur s'est produite lors de l'envoi du travail :", response.status);
        }
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
        <img id="imagePreview">
        <div id="previewPictureLabel">
          <i class="fa-regular fa-image" aria-hidden="true"></i>
          <label id="falseImageInput">+ Ajouter photo</label>
          <input type="file" name="image" id="imageInput" multiple="false" accept=".png, .jpeg, .jpg">
          <p id="imageInputH3">jpg, png : 4mo max</pp>
        </div>
        <label for="title">Titre</label><input type="text" name="title" id="title">
        <label for="category">Catégorie</label>
        <select id="categories"></select>
        <span>
          <input id="fillInPhotosFormSubmitButton" type="submit" value="Valider" disabled>
        </span>
      </form>
    </div>`
  );

  document.getElementById("falseImageInput").addEventListener("click", function() {
    document.getElementById("imageInput").click();
  });
  
  const imageInput = document.getElementById("imageInput");
  imageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    
    if (file) {
      const imagePreview = document.getElementById('imagePreview');
      const imageUrl = URL.createObjectURL(file);
      imagePreview.src = imageUrl;

      imagePreview.onload = function() {
        URL.revokeObjectURL(imageUrl);
      };

      const hideLabel = document.getElementById("falseImageInput");
      hideLabel.style.width = "150px";
    } else {
      return
    }
  });

  function toggleSubmitButton() {

    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("categories");
    const submitButton = document.getElementById("fillInPhotosFormSubmitButton");

    // Vérifier si tous les champs sont remplis pour avoir une valeur de isFilled true ou false
    const isFilled = imageInput.value.trim() !== "" && titleInput.value.trim() !== "" && categorySelect.value !== "";

    // Activer ou désactiver le bouton de soumission en fonction de l'état des champs
    if (isFilled) {
        submitButton.removeAttribute("disabled");
        submitButton.style.backgroundColor = "#1D6154";
    } else {
        submitButton.setAttribute("disabled", true);
        submitButton.style.backgroundColor = "#A7A7A7";
    }
  }

    document.getElementById("fillInPhotosForm").addEventListener("input", toggleSubmitButton);
    document.getElementById("categories").addEventListener("change", toggleSubmitButton);

  document.getElementById("fillInPhotosForm").addEventListener("submit", async (event) => {
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

      const response = await sendWork(formData, token);

      if (response.ok) {
        loadLastWork();
        resetSendWorkForm();
      } else {
        const fillInPhotosForm = document.getElementById(`fillInPhotosForm`);
        console.error(response.status);
        submitButton.style.backgroundColor = "red";
        fillInPhotosForm.insertAdjacentHTML(
          `beforeend`,
            `
            <p id="addingPhotosFormError">Une erreur s'est produite lors de l'envoi du travail. (Erreur : ${response.status})</p>
            `
        );
        setTimeout(() => {
          const errorMessageElement = document.getElementById("addingPhotosFormError");
          errorMessageElement.remove();
          submitButton.style.backgroundColor = "#1D6154";
        }, 5000);
      }
    } else {
      console.error("Veuillez sélectionner une image.");
      const addingPhotosForm = document.getElementById(`addingPhotosForm`);
      console.error(response.status);
      addingPhotosForm.insertAdjacentHTML(
        `beforeend`,
          `
          <h3 id="addingPhotosFormError">Veuillez sélectionner une image.</h3>
          `
      );
      setTimeout(() => {
        const errorMessageElement = document.getElementById("addingPhotosFormError");
        errorMessageElement.remove();
      }, 5000);
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
  document.getElementById(`edit__divOverlay`).addEventListener(`click`, returnToEditMode);

  getCategoriesInput();

  async function resetSendWorkForm() {

    const hideLabel = document.getElementById("falseImageInput");
    const categoryLabelInput = document.getElementById("categories");
    hideLabel.style.width = "220px";
    document.getElementById("imageInput").value = "";
    (document.getElementById("imagePreview")).src="";
    categoryLabelInput.selectedIndex = -1;
    document.getElementById("title").value = "";
    toggleSubmitButton();
  }
}

async function main() {
  await loadCategories();
  await loadWorks();
  filterWorks();
  connectionStatus();
}

main();