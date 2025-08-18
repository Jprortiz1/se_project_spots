let cardToDelete = null;
let cardIdToDelete = null;

import "./index.css";
import Api from "../scripts/Api.js";
import { resetValidation, validationSettings } from "../scripts/validation.js";

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
// Edit post
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
//Cards
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
// Avatar modal
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = document.forms["avatar-form"];
const avatarInput = avatarForm.querySelector("#avatar-url-input");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarElement = document.querySelector(".profile__avatar");
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

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.likes && data.likes.length > 0) {
    likeButton.classList.add("card__like-button_active");
  }

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains("card__like-button_active");
    const method = isLiked ? api.removeLike(data._id) : api.addLike(data._id);

    method
      .then((updatedCard) => {
        likeButton.classList.toggle(
          "card__like-button_active",
          updatedCard.likes.length > 0
        );
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
  resetValidation(editFormElement, validationSettings);
  openModal(editModal);
}
function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const newName = editModalNameInput.value;
  const newAbout = editModalDescInput.value;

  const submitButton = editFormElement.querySelector(".modal__submit-btn");
  submitButton.innerHTML = "Saving...";

  api
    .updateUserInfo({ name: newName, about: newAbout })
    .then((updatedUser) => {
      profileName.textContent = updatedUser.name;
      profileDescription.textContent = updatedUser.about;
      closeModal(editModal);
      submitButton.innerHTML = "Save";
    })
    .catch((err) => {
      console.error("Error al actualizar perfil:", err);
      submitButton.innerHTML = "Save";
    });
}
function handleNewPostFormSubmit(evt) {
  evt.preventDefault();
  const name = cardTitleInput.value;
  const link = cardUrlInput.value;

  const submitButton = newPostForm.querySelector(".modal__submit-btn");

  submitButton.innerHTML = "Creating...";

  api
    .addCard({ name, link })
    .then((cardData) => {
      const newCard = getCardElement(cardData);
      cardsList.prepend(newCard);
      closeModal(newPostModal);
      newPostForm.reset();
      submitButton.innerHTML = "Create";
    })
    .catch((err) => {
      console.error("Error al agregar nueva tarjeta:", err);
      submitButton.innerHTML = "Create";
    });
}
function handleUpdateAvatar(evt) {
  evt.preventDefault();

  const avatarUrl = avatarInput.value;

  const submitButton = avatarForm.querySelector(".modal__submit-btn");

  console.log(submitButton.innerText);
  submitButton.innerText = "Saving...";

  api
    .updateAvatar({ avatar: avatarUrl })
    .then((updatedUser) => {
      avatarElement.src = updatedUser.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
      submitButton.innerText = "Save";
    })
    .catch((err) => {
      console.error("Error al actualizar avatar:", err);
      submitButton.innerText = "Save";
    });
}
function hanldeDeleteCard(evt) {
  evt.preventDefault();

  const deleteButton = deleteConfirmationForm.querySelector(
    ".modal__button_type_delete"
  );

  deleteButton.innerHTML = "Deleting...";

  if (!cardIdToDelete) return;

  api
    .deleteCard(cardIdToDelete)
    .then(() => {
      cardToDelete.remove();
      closeModal(deleteConfirmationModal);
      cardToDelete = null;
      cardIdToDelete = null;
      deleteButton.innerHTML = "Delete";
    })
    .catch((err) => {
      console.error("Error al eliminar tarjeta:", err);
      deleteButton.innerHTML = "Delete";
    });
}

/* ---------- EVENT LISTENERS ---------- */
profileEditButton.addEventListener("click", handleEditButtonClick);
editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
editFormElement.addEventListener("submit", handleEditFormSubmit);
newPostForm.addEventListener("submit", handleNewPostFormSubmit);
avatarForm.addEventListener("submit", handleUpdateAvatar);
addPostButton.addEventListener("click", () => openModal(newPostModal));
newPostModalCloseBtn.addEventListener("click", () => closeModal(newPostModal));
avatarModalCloseBtn.addEventListener("click", () => closeModal(avatarModal));
deleteConfirmationForm.addEventListener("submit", hanldeDeleteCard);
avatarElement.addEventListener("click", () => {
  openModal(avatarModal);
});
imagePreviewModalCloseBtn.addEventListener("click", () => {
  closeModal(imagePreviewModal);
});
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

// Cerrar modales con fondo o botón cerrar
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
