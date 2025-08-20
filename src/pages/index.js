// src/scripts/index.js

let cardToDelete = null;
let cardIdToDelete = null;
let currentUserId = null; // para saber si el usuario actual dio like

import "./index.css";
import Api from "../scripts/Api.js";
import {
  resetValidation,
  validationSettings,
  enableValidation,
} from "../scripts/validation.js";

// Carga imágenes
import logoSrc from "../images/Logo.svg";
import pencilSrc from "../images/Pencil.svg";
import plusSrc from "../images/Plus-icon.svg";
import avatarSrc from "../images/avatar.jpg";

// Establece las imágenes en el DOM
document.querySelector(".header__logo").src = logoSrc;
document.querySelector(".profile__avatar").src = avatarSrc;
document.querySelector(".profile__edit-icon").src = pencilSrc;
document.querySelector(".profile__add-icon").src = plusSrc;

// Instancia de la API
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "196c3c0c-9822-4b39-9642-5a69a82325c6",
    "Content-Type": "application/json",
  },
});

/* ---------- ELEMENT REFERENCES ---------- */
const profileEditButton = document.querySelector(".profile__edit-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Edit profile
const editModal = document.querySelector("#edit-modal");
const editFormElement = document.forms["edit-profile-form"];
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescInput = editModal.querySelector(
  "#profile-description-input"
);

// New post
const addPostButton = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = document.forms["new-post-form"];
const newPostModalCloseBtn = newPostModal.querySelector(".modal__close-btn");
const cardTitleInput = newPostForm.querySelector("#card-title-input");
const cardUrlInput = newPostForm.querySelector("#card-url-input");

// Image preview
const imagePreviewModal = document.querySelector("#image-preview-modal");
const imagePreviewModalCloseBtn =
  imagePreviewModal.querySelector(".modal__close-btn");
const imagePreviewElement = imagePreviewModal.querySelector(".modal__image");
const imagePreviewCaption = imagePreviewModal.querySelector(".modal__caption");

// Cards
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// Avatar modal
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.forms["avatar-form"];
const avatarInput = avatarForm.querySelector("#avatar-url-input");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarElement = document.querySelector(".profile__avatar");
const avatarEditButton = document.querySelector(".profile__avatar-edit-button");

// Delete confirmation modal
const deleteConfirmationModal = document.querySelector(
  "#delete-confirmation-modal"
);
const deleteConfirmationForm = document.forms["delete-confirmation-form"];
const cancelDeleteBtn =
  deleteConfirmationModal.querySelector("#cancel-delete-btn");
const deleteConfirmationModalCloseBtn =
  deleteConfirmationModal.querySelector(".modal__close-btn");

/* ---------- MODAL HELPERS ---------- */
function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openModalEl = document.querySelector(".modal_opened");
    if (openModalEl) closeModal(openModalEl);
  }
}
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}
function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}

/* ---------- CARD CREATION ---------- */
function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardImageEl = cardElement.querySelector(".card__image");
  const cardNameEl = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const likeCounter = cardElement.querySelector(".card__like-count"); // opcional

  // Siempre textContent para texto
  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Estado inicial de like
  const liked =
    (typeof data.isLiked === "boolean" && data.isLiked) ||
    (Array.isArray(data.likes) &&
      currentUserId &&
      data.likes.some((u) => u._id === currentUserId));

  likeButton.classList.toggle("card__like-button_active", !!liked);
  if (likeCounter && Array.isArray(data.likes)) {
    likeCounter.textContent = data.likes.length;
  }

  likeButton.addEventListener("click", () => {
    const isActive = likeButton.classList.contains("card__like-button_active");
    const req = isActive ? api.removeLike(data._id) : api.addLike(data._id);

    req
      .then((updatedCard) => {
        const nowLiked =
          (typeof updatedCard.isLiked === "boolean" && updatedCard.isLiked) ||
          (Array.isArray(updatedCard.likes) &&
            currentUserId &&
            updatedCard.likes.some((u) => u._id === currentUserId));

        likeButton.classList.toggle("card__like-button_active", !!nowLiked);
        if (likeCounter && Array.isArray(updatedCard.likes)) {
          likeCounter.textContent = updatedCard.likes.length;
        }
      })
      .catch((err) => console.error("Error al actualizar like:", err));
  });

  deleteButton.addEventListener("click", () => {
    cardToDelete = cardElement;
    cardIdToDelete = data._id;
    openModal(deleteConfirmationModal);
  });

  cardImageEl.addEventListener("click", () => {
    imagePreviewElement.src = data.link;
    imagePreviewElement.alt = data.name;
    imagePreviewCaption.textContent = data.name;
    openModal(imagePreviewModal);
  });

  return cardElement;
}

/* ---------- EVENT HANDLERS ---------- */
function handleEditButtonClick() {
  editModalNameInput.value = profileName.textContent;
  editModalDescInput.value = profileDescription.textContent;
  resetValidation(editFormElement, validationSettings); // botón "Save" deshabilitado si inválido
  openModal(editModal);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const newName = editModalNameInput.value;
  const newAbout = editModalDescInput.value;

  const submitButton = editFormElement.querySelector(".modal__submit-btn");
  const defaultText = "Save";

  submitButton.textContent = "Saving...";
  submitButton.disabled = true;

  api
    .updateUserInfo({ name: newName, about: newAbout })
    .then((updatedUser) => {
      profileName.textContent = updatedUser.name;
      profileDescription.textContent = updatedUser.about;
      closeModal(editModal);
      resetValidation(editFormElement, validationSettings);
    })
    .catch((err) => {
      console.error("Error al actualizar perfil:", err);
    })
    .finally(() => {
      submitButton.textContent = defaultText; // restaurar solo aquí
      submitButton.disabled = false;
    });
}

function handleNewPostFormSubmit(evt) {
  evt.preventDefault();
  const name = cardTitleInput.value.trim();
  const link = cardUrlInput.value.trim();

  const submitButton = newPostForm.querySelector(".modal__submit-btn");
  const defaultText = "Create";

  submitButton.textContent = "Creating...";
  submitButton.disabled = true;

  api
    .addCard({ name, link })
    .then((cardData) => {
      const newCard = getCardElement(cardData);
      cardsList.prepend(newCard);
      closeModal(newPostModal);
      newPostForm.reset();
      resetValidation(newPostForm, validationSettings); // vuelve a deshabilitar si vacío
    })
    .catch((err) => {
      console.error("Error al agregar nueva tarjeta:", err);
    })
    .finally(() => {
      submitButton.textContent = defaultText; // restaurar solo aquí
      submitButton.disabled = false;
    });
}

function handleUpdateAvatar(evt) {
  evt.preventDefault();

  const avatarUrl = avatarInput.value.trim();
  const submitButton = avatarForm.querySelector(".modal__submit-btn");
  const defaultText = "Save";

  submitButton.textContent = "Saving...";
  submitButton.disabled = true;

  api
    .updateAvatar({ avatar: avatarUrl })
    .then((updatedUser) => {
      avatarElement.src = updatedUser.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
      resetValidation(avatarForm, validationSettings);
    })
    .catch((err) => {
      console.error("Error al actualizar avatar:", err);
    })
    .finally(() => {
      submitButton.textContent = defaultText; // restaurar solo aquí
      submitButton.disabled = false;
    });
}

// 🔹 Función reutilizable para abrir el modal de avatar
function openAvatarModal() {
  avatarForm.reset();
  resetValidation(avatarForm, validationSettings);
  openModal(avatarModal);
}

function hanldeDeleteCard(evt) {
  evt.preventDefault();

  const deleteButton = deleteConfirmationForm.querySelector(
    ".modal__button_type_delete"
  );
  const defaultText = "Delete";

  deleteButton.textContent = "Deleting...";
  deleteButton.disabled = true;

  if (!cardIdToDelete) {
    deleteButton.textContent = defaultText;
    deleteButton.disabled = false;
    return;
  }

  api
    .deleteCard(cardIdToDelete)
    .then(() => {
      cardToDelete.remove();
      closeModal(deleteConfirmationModal);
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.error("Error al eliminar tarjeta:", err);
    })
    .finally(() => {
      deleteButton.textContent = defaultText; // restaurar solo aquí
      deleteButton.disabled = false;
    });
}
// Activa la validación en todos los formularios
enableValidation(validationSettings);
/* ---------- EVENT LISTENERS ---------- */

// Edit profile
profileEditButton.addEventListener("click", handleEditButtonClick);
editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
editFormElement.addEventListener("submit", handleEditFormSubmit);

// New post
newPostForm.addEventListener("submit", handleNewPostFormSubmit);
addPostButton.addEventListener("click", () => {
  newPostForm.reset();
  resetValidation(newPostForm, validationSettings); // botón "Create" gris si vacío
  openModal(newPostModal);
});
newPostModalCloseBtn.addEventListener("click", () => closeModal(newPostModal));

// Avatar
avatarForm.addEventListener("submit", handleUpdateAvatar);
avatarElement.addEventListener("click", openAvatarModal);
if (avatarEditButton) {
  avatarEditButton.addEventListener("click", openAvatarModal);
}
avatarModalCloseBtn.addEventListener("click", () => closeModal(avatarModal));

// Image preview close (opcional: ya lo manejas por overlay)
if (imagePreviewModalCloseBtn) {
  imagePreviewModalCloseBtn.addEventListener("click", () =>
    closeModal(imagePreviewModal)
  );
}

// Delete confirmation
deleteConfirmationForm.addEventListener("submit", hanldeDeleteCard);
cancelDeleteBtn.addEventListener("click", () => {
  closeModal(deleteConfirmationModal);
  cardToDelete = null;
  cardIdToDelete = null;
});
deleteConfirmationModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteConfirmationModal);
  cardToDelete = null;
  cardIdToDelete = null;
});

/* ---------- CARGAR DATOS DESDE LA API ---------- */
Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([userData, cards]) => {
    currentUserId = userData._id; // necesario para pintar likes del usuario
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    avatarElement.src = userData.avatar;

    cards
      .reverse()
      .forEach((cardData) => cardsList.prepend(getCardElement(cardData)));
  })
  .catch((err) => {
    console.error("Error al cargar datos desde la API:", err);
  });

/* ---------- Cerrar modales con fondo o botón cerrar ---------- */
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (
      evt.target === modal ||
      evt.target.classList.contains("modal__close-btn")
    ) {
      closeModal(modal);
    }
  });
});
