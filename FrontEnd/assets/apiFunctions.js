export async function getCategories(categoriesList) {
  // Nous récupérons les catégories depuis l'API
  const response = await fetch("http://localhost:5678/api/categories");
  return await response.json();
};

export async function getWorks(worksList) {
  // Récupération du tableau works depuis l'API
  const response = await fetch("http://localhost:5678/api/works");
  return await response.json();
};

export async function sendWork(formData, token) {
  try {
    formData.values().forEach(value => {
    });
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    return response;

  } catch (error) {
    console.error("Une erreur s'est produite lors de l'envoi du travail :", response.status);
    throw error;
  }
};

export async function deleteWorkById(id, token) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return response;
  } catch (error) {
    console.error("Une erreur s'est produite lors de la suppression du travail :", response.status);
    throw error;
  }
};

export async function getLastWork() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
    return works.slice(-1);
  } catch (error) {
    console.error("Une erreur s'est produite lors du chargement du dernier travail :", response.status);
    throw error;
  }
};
