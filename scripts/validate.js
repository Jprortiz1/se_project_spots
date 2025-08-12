function showInputError(form, input, errorMessage, settings) {
  const errorElement = form.querySelector(`#${input.id}-error`);
  input.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
}

function hideInputError(form, input, settings) {
  const errorElement = form.querySelector(`#${input.id}-error`);
  input.classList.remove(settings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
}

function checkInputValidity(form, input, settings) {
  if (!input.validity.valid) {
    showInputError(form, input, input.validationMessage, settings);
  } else {
    hideInputError(form, input, settings);
  }
}

function hasInvalidInput(inputs) {
  return inputs.some((input) => !input.validity.valid);
}

function toggleButtonState(inputs, button, settings) {
  if (hasInvalidInput(inputs)) {
    button.classList.add(settings.inactiveButtonClass);
    button.disabled = true;
  } else {
    button.classList.remove(settings.inactiveButtonClass);
    button.disabled = false;
  }
}

function setEventListeners(form, settings) {
  const inputList = Array.from(form.querySelectorAll(settings.inputSelector));
  const submitButton = form.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, submitButton, settings);

  inputList.forEach((input) => {
    input.addEventListener("input", () => {
      checkInputValidity(form, input, settings);
      toggleButtonState(inputList, submitButton, settings);
    });
  });
}

function enableValidation(settings) {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((form) => {
    form.addEventListener("submit", (evt) => evt.preventDefault());
    setEventListeners(form, settings);
  });
}

function resetValidation(form, settings) {
  const inputList = Array.from(form.querySelectorAll(settings.inputSelector));
  const button = form.querySelector(settings.submitButtonSelector);
  inputList.forEach((input) => hideInputError(form, input, settings));
  toggleButtonState(inputList, button, settings);
}

// Configuración e inicio
const validationSettings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__input-error_active",
};

enableValidation(validationSettings);
