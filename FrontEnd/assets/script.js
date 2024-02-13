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

  const loginButton = document.getElementById("connectionStatus");

  // Gestion du bouton "Modifier" en sélectionnant la div vide déjà existante (définie en dehors de la condition pour éviter la répétition)
  const editDiv = document.querySelector(".portfolio__div__edit");

  // Gestion du header
  const header = document.querySelector("header");

  // Si le token est présent, je peux commencer les changements dans l'HTML
  if (userToken) {
    // J'ajoute une <div> mode édition dans le header
    const editDivHeader = document.createElement("div");
    editDivHeader.id = "header__editDiv";

    // J'ajoute l'icône <i>
    const editIconHeader = document.createElement("i");
    editIconHeader.className = "fa-regular fa-pen-to-square";
    editIconHeader.setAttribute("aria-hidden", "true");

    // J'ajoute le texte "Mode édition"
    const editTextHeader = document.createElement("p");
    editTextHeader.textContent = "Mode édition";

    // Ajoutez l'icône et le texte dans le div
    editDivHeader.appendChild(editIconHeader);
    editDivHeader.appendChild(editTextHeader);

    // Ajoutez le div à la fin du header et augmenter la margin top du header
    header.appendChild(editDivHeader);
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
      connectionStatus();
    };

    loginButton.addEventListener("click", logoutHandler);

    // Masquer la grille des catégories
    const categoriesContainer = document.querySelector(".categories");
    categoriesContainer.style.display = "none";
    console.log("J'ai masqué la barre de catégories");

    // Création d'un élément <a> avec un <i> et un <b> à l'intérieur
    const editorDiv = document.createElement("div");
    editorDiv.addEventListener("click", editPopUp);
    const penToSquareIcon = document.createElement("i");
    penToSquareIcon.className = "fa-regular fa-pen-to-square";
    const boldElement = document.createElement("b");
    boldElement.textContent = "modifier";
    boldElement.style.cursor = "default";

    addEventListener;

    // Mettre les éléments <i> et <b> dans le parent <a>
    editorDiv.appendChild(penToSquareIcon);
    editorDiv.appendChild(boldElement);

    // Mettre l'élément <a> dans la div parent "portfolio__div__edit"
    editDiv.appendChild(editorDiv);
  } else {
    console.log("Aucun token n'as été détecté dans le localStorage");
    loginButton.textContent = "login";

    // Afficher à nouveau la grille des catégories
    const categoriesContainer = document.querySelector(".categories");
    categoriesContainer.style.display = "flex";

    // Supprimer la <div> "Mode édition" ainsi que reinitialiser la margin du header
    header.removeChild(header__editDiv);
    header.style.marginTop = "50px";

    // Supprimer le bouton modifier s'il était présent
    while (editDiv.firstChild) {
      editDiv.removeChild(editDiv.firstChild);
    }
  }
}

function editPopUp() {
  const main = document.querySelector("main");
  const overlayDiv = document.createElement("div");
  overlayDiv.id = "edit__divOverlay";
  const overlayEditDiv = document.createElement("div");
  overlayEditDiv.id = "editForm";
  const exitEditModeCross = document.createElement("i");
  exitEditModeCross.className = "fa-solid fa-xmark";
  const editModeTitle = document.createElement("h3");
  editModeTitle.textContent = "Galerie photo";
  const editGalleryContainer = document.createElement("div");
  editGalleryContainer.className = "galleryEditor gallery";

  const exitEditMode = function (event) {
    main.removeChild(overlayDiv);
    main.removeChild(overlayEditDiv);
  };

  main.appendChild(overlayDiv);
  main.appendChild(overlayEditDiv);
  overlayEditDiv.appendChild(exitEditModeCross);
  overlayEditDiv.appendChild(editModeTitle);
  overlayEditDiv.appendChild(editGalleryContainer);

  exitEditModeCross.addEventListener("click", exitEditMode);

  getWorksEditMode();

  const divAddingPhotosInput = document.createElement("span");
  const addingPhotosInput = document.createElement("input");
  addingPhotosInput.setAttribute("type", "submit");
  addingPhotosInput.setAttribute("value", "Ajouter une photo");
  addingPhotosInput.addEventListener("click", addingPhotosMode);
  overlayEditDiv.appendChild(divAddingPhotosInput);
  divAddingPhotosInput.appendChild(addingPhotosInput);
}

function addingPhotosMode() {
  console.log("Le bouton d'ajout d'une photo a été cliqué");
  const main = document.querySelector("main");
  const overlayAddingPhotosDiv = document.createElement("div");
  overlayAddingPhotosDiv.id = "addingPhotosForm";
  const navigationButtonsAddingPhotosDiv = document.createElement("div");
  navigationButtonsAddingPhotosDiv.id = "navigationButtonsAddingPhotosDiv";
  const returnToEditModeArrow = document.createElement("i");
  returnToEditModeArrow.className = "fa-solid fa-arrow-left";
  const exitAddingPhotosModeCross = document.createElement("i");
  exitAddingPhotosModeCross.className = "fa-solid fa-xmark";
  const addingPhotosModeTitle = document.createElement("h3");
  addingPhotosModeTitle.textContent = "Ajout photo";
  const addingPhotosDiv = document.createElement("div");
  addingPhotosDiv.className = "addingPhotosDiv";
  const returnToEditMode = function (event) {
    main.removeChild(overlayAddingPhotosDiv);
  };

  const exitAddingPhotosMode = function (event) {
    const overlayDiv = document.getElementById("edit__divOverlay");
    const overlayEditDiv = document.getElementById("editForm");
    main.removeChild(overlayAddingPhotosDiv);
    main.removeChild(overlayDiv);
    main.removeChild(overlayEditDiv);
  };

  main.appendChild(overlayAddingPhotosDiv);
  overlayAddingPhotosDiv.appendChild(navigationButtonsAddingPhotosDiv);
  navigationButtonsAddingPhotosDiv.appendChild(returnToEditModeArrow);
  navigationButtonsAddingPhotosDiv.appendChild(exitAddingPhotosModeCross);
  overlayAddingPhotosDiv.appendChild(addingPhotosModeTitle);
  overlayAddingPhotosDiv.appendChild(addingPhotosDiv);

  returnToEditModeArrow.addEventListener("click", returnToEditMode);
  exitAddingPhotosModeCross.addEventListener("click", exitAddingPhotosMode);

  const divSendingPhotosInput = document.createElement("span");
  const sendingPhotosInput = document.createElement("input");
  sendingPhotosInput.setAttribute("type", "submit");
  sendingPhotosInput.setAttribute("value", "Valider");
  sendingPhotosInput.addEventListener("click", addingPhotosMode);
  overlayAddingPhotosDiv.appendChild(divSendingPhotosInput);
  divSendingPhotosInput.appendChild(sendingPhotosInput);
}

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

async function main() {
  await getCategories();
  await getWorks();
  filterWorks();
  await connectionStatus();
}

main();
