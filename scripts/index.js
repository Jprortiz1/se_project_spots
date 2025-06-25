// Initial cards data
const initialCards = [
  {
    name: "Golden Gate bridge",
    link: " https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
    description: "A beautiful ski resort in the French Alps.",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
    description: "A cozy restaurant terrace with a great view.",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
    description: "A relaxing outdoor cafe to enjoy your coffee.",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
    description: "A scenic bridge that stretches across a lush forest.",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
    description:
      "A beautiful tunnel with soft morning light filtering through.",
  },
];

// Profile elements
const profileEditButton = document.querySelector(".profile__edit-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Edit Modal elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = document.forms["edit-profile-form"];
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// New Post Modal elements
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = document.forms["new-post-form"];
const newPostModalCloseBtn = newPostModal.querySelector(".modal__close-btn");
const cardTitleInput = newPostForm.querySelector("#card-title-input");
const cardUrlInput = newPostForm.querySelector("#card-url-input");

// Image Preview Modal elements
const imagePreviewModal = document.querySelector("#image-preview-modal");
const imagePreviewModalCloseBtn =
  imagePreviewModal.querySelector(".modal__close-btn");
const imagePreviewElement = imagePreviewModal.querySelector(".modal__image");
const imagePreviewCaption = imagePreviewModal.querySelector(".modal__caption");

// Función para cerrar con tecla Escape
function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openModalElement = document.querySelector(".modal_opened");
    if (openModalElement) {
      closeModal(openModalElement);
    }
  }
}
// Open/Close Modal functions
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}

// Template and card container
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// Create card element from data
function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Like button toggle functionality
  likeButton.addEventListener("click", () => {
    likeButton.classList.toggle("card__like-button_active");
  });

  // Delete button functionality
  deleteButton.addEventListener("click", () => {
    cardElement.remove();
  });

  // Image click -> open preview modal
  cardImageEl.addEventListener("click", () => {
    imagePreviewElement.src = data.link;
    imagePreviewElement.alt = data.name;
    imagePreviewCaption.textContent = data.name;
    openModal(imagePreviewModal);
  });

  return cardElement;
}

// Handle profile edit button click
function handleEditButtonClick() {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  openModal(editModal);
}

// Handle profile form submit
function handleEditFormSubmit(evt) {
  evt.preventDefault();
  profileName.textContent = editModalNameInput.value;
  profileDescription.textContent = editModalDescriptionInput.value;
  closeModal(editModal);
}

// Handle New Post form submit
function handleNewPostFormSubmit(evt) {
  evt.preventDefault();

  const newCardData = {
    name: cardTitleInput.value,
    link: cardUrlInput.value,
  };

  const newCard = getCardElement(newCardData);
  cardsList.prepend(newCard);

  closeModal(newPostModal);
  newPostForm.reset();
}

// Event listeners
profileEditButton.addEventListener("click", handleEditButtonClick);
editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
editFormElement.addEventListener("submit", handleEditFormSubmit);
imagePreviewModalCloseBtn.addEventListener("click", () =>
  closeModal(imagePreviewModal)
);

const addPostButton = document.querySelector(".profile__add-btn");
addPostButton.addEventListener("click", () => openModal(newPostModal));

newPostModalCloseBtn.addEventListener("click", () => closeModal(newPostModal));
newPostForm.addEventListener("submit", handleNewPostFormSubmit);

// Image modal close button
imagePreviewModalCloseBtn.addEventListener("click", () =>
  closeModal(imagePreviewModal)
);
// Cerrar el modal haciendo clic en el overlay (fondo oscuro)
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});

// Render initial cards
initialCards.forEach((cardData) => {
  const cardElement = getCardElement(cardData);
  cardsList.prepend(cardElement);
});
