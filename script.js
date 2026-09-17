(function () {
  "use strict";

  var form = document.getElementById("signup-form");
  var formSection = document.getElementById("form-section");
  var summarySection = document.getElementById("summary-section");
  var globalError = document.getElementById("global-error");
  var backBtn = document.getElementById("back-btn");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  var FIELDS = [
    { id: "login", label: "Login" },
    { id: "password", label: "Mot de passe" },
    { id: "confirm", label: "Confirmation du mot de passe" },
    { id: "lastname", label: "Nom" },
    { id: "firstname", label: "Prénom" },
    { id: "address", label: "Adresse" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Téléphone" },
    { id: "birthdate", label: "Date de naissance" }
  ];

  function clearErrors() {
    FIELDS.forEach(function (field) {
      document.getElementById("error-" + field.id).textContent = "";
      document.getElementById(field.id).classList.remove("invalid");
    });
    globalError.textContent = "";
    globalError.hidden = true;
  }

  function setError(id, message) {
    document.getElementById("error-" + id).textContent = message;
    document.getElementById(id).classList.add("invalid");
  }

  function showGlobalError(message) {
    globalError.textContent = message;
    globalError.hidden = false;
  }

  function getValues() {
    var values = {};
    FIELDS.forEach(function (field) {
      values[field.id] = document.getElementById(field.id).value.trim();
    });
    return values;
  }

  function validate(values) {
    var errors = [];

    FIELDS.forEach(function (field) {
      if (values[field.id] === "") {
        setError(field.id, "Ce champ est requis.");
        errors.push(field.label);
      }
    });

    if (errors.length > 0) {
      showGlobalError("Veuillez remplir tous les champs obligatoires.");
      return false;
    }

    if (!EMAIL_RE.test(values.email)) {
      setError("email", "Adresse email invalide.");
      showGlobalError("L'adresse email saisie n'est pas valide.");
      return false;
    }

    if (values.password !== values.confirm) {
      setError("confirm", "Les mots de passe ne correspondent pas.");
      showGlobalError("Le mot de passe et sa confirmation sont différents.");
      return false;
    }

    return true;
  }

  function formatDate(isoDate) {
    var parts = isoDate.split("-");
    if (parts.length !== 3) {
      return isoDate;
    }
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function showSummary(values) {
    document.getElementById("sum-login").textContent = values.login;
    document.getElementById("sum-lastname").textContent = values.lastname;
    document.getElementById("sum-firstname").textContent = values.firstname;
    document.getElementById("sum-address").textContent = values.address;
    document.getElementById("sum-email").textContent = values.email;
    document.getElementById("sum-phone").textContent = values.phone;
    document.getElementById("sum-birthdate").textContent = formatDate(values.birthdate);

    formSection.hidden = true;
    summarySection.hidden = false;
    window.scrollTo(0, 0);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    var values = getValues();
    if (validate(values)) {
      showSummary(values);
    }
  });

  FIELDS.forEach(function (field) {
    document.getElementById(field.id).addEventListener("input", function () {
      document.getElementById("error-" + field.id).textContent = "";
      this.classList.remove("invalid");
    });
  });

  backBtn.addEventListener("click", function () {
    summarySection.hidden = true;
    formSection.hidden = false;
    document.getElementById("login").focus();
  });
})();
