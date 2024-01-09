import { render } from 'sass';
import { shuffledRecipes, recipesToCook, getRandomIndex } from './scripts';
import { saveRecipe, removeRecipe } from '../src/users';
import { searchRecipes, calcRecipeCost, formatRecipeIngredients } from '../src/recipes';
import { fetchData, postUrl } from './apiCalls';

const allRecipesBtn = document.querySelector('#allRecipesBtn');
const homeContainer = document.querySelector('.home-container');
const viewHomeBtn = document.querySelector('#viewHomeBtn');
const homeTitle = document.querySelector('.recipeOtd');
const recipeCost = document.querySelector('.recipe-cost');
const recipeImage = document.querySelector('.recipe-img');
const recipeIngredients = document.querySelector('.ingredients-list');
const recipeInstructions = document.querySelector('.instructions-list');
const recipesContainer = document.querySelector('.recipes-container');
const recipeTitle = document.querySelector('.recipe-title');
const removeSavedRecipeBtn = document.querySelector('#rmvBtn');
const saveRecipeBtn = document.querySelector('#saveBtn');
const searchInputAll = document.querySelector('#searchAll');
const searchInputSaved = document.querySelector('#searchSaved');
const searchSavedContainer = document.querySelector('.search-saved-container');
const viewSavedBtn = document.querySelector('#viewSavedBtn');
const toRecipeContainer = document.querySelector('.to-recipe-container');
const selectedUser = document.querySelector('#userBtn');
const printModalButton = document.querySelector('.print-modal-button');
const printBtn = document.querySelector('.print-button');
const closePrintModalBtn = document.querySelector('.close-modal');
const printModalDisplay = document.querySelector('.print-modal');

let recipeData;
let ingredientsData;
let userData;
let currentUser;
let currentRecipe;

window.addEventListener('load', () => {
  retrieveData();
});
viewHomeBtn.addEventListener('click', () => {
  displayRecipesHome(recipeData);
  renderHomeView();
});
removeSavedRecipeBtn.addEventListener('click', () => {
  removeRecipe(recipesToCook, currentRecipe);
});
saveRecipeBtn.addEventListener('click', () => {
  postUserFavorite(saveRecipe(recipesToCook, currentRecipe));
});
viewSavedBtn.addEventListener('click', e => {
  renderSavedRecipes(e);
});
recipesContainer.addEventListener('click', e => {
  goToRecipe(e, recipeData);
});
homeContainer.addEventListener('click', e => {
  goToRecipe(e, recipeData);
});
allRecipesBtn.addEventListener('click', e => {
  renderAllRecipes(e);
});
searchInputAll.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    userSearchRecipes(recipeData, searchInputAll);
  }
});
searchInputSaved.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    userSearchRecipes(recipesToCook, searchInputSaved);
  }
});
printModalButton.addEventListener('click', printPage);
printBtn.addEventListener('click', openPrintModal);
closePrintModalBtn.addEventListener('click', closePrintModal);

function retrieveData() {
  fetchData()
    .then(responses => {
      return Promise.all(
        responses.map(response => {
          if (!response.ok) {
            throw new Error('Ooops!');
          }
          return response.json();
        })
      );
    })
    .then(data => {
      recipeData = data[0].recipes;
      ingredientsData = data[1].ingredients;
      userData = data[2].users;
      displayRecipesHome(recipeData);
      renderRandomUser();
      refreshUsersSavedRecipes();
    })
    .catch(error => {
      console.error('One or more fetch requests failed', error);
      homeContainer.innerHTML += `<p>Appologies, something went wrong!</p>`;
    });
}

function postUserFavorite(saveRecipe) {
  fetch(postUrl, {
    method: 'POST',
    body: JSON.stringify({
      userID: currentUser.id,
      recipeID: currentRecipe.id
    }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(data => {
      saveRecipe;
      retrieveData();
    })
    .catch(error => console.log(error));
}

function refreshUsersSavedRecipes() {
  recipeData.forEach(recipe => {
    const match = currentUser.recipesToCook.find(id => recipe.id === id);
    if (match) recipesToCook.push(recipe);
  });
}

export function renderRandomUser() {
  currentUser = userData.find(user => user.id === 46);
  // currentUser = userData[getRandomIndex(userData)];
  selectedUser.innerText = `Hello ${currentUser.name}!`;
}

export function displayRecipesHome(recipeData) {
  let recipesFull = shuffledRecipes(recipeData);
  let recipes = recipesFull.slice(0, 3);
  homeContainer.innerHTML = '';
  recipes.forEach(recipe => {
    renderRecipeCard(homeContainer, recipe);
  });
}

function renderAllRecipes(e) {
  const click = e.target.closest('a');
  const sorted = recipeData.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
  if (click.id === 'allRecipesBtn') {
    renderAllRecipesView();
    recipesContainer.innerHTML = '';
    sorted.forEach(recipe => {
      renderRecipeCard(recipesContainer, recipe);
    });
  }
}

function userSearchRecipes(givenRecipes, input) {
  const searchTerm = input.value.trim();
  const filtered = searchRecipes(givenRecipes, searchTerm);
  if (!searchTerm) return;
  if (typeof filtered === 'string') {
    renderSearchResult();
    recipesContainer.innerHTML = '';
    recipesContainer.innerHTML = `<p>${filtered}</p>`;
    return;
  }
  renderSearchResult();
  recipesContainer.innerHTML = ``;
  filtered.forEach(recipe => {
    renderRecipeCard(recipesContainer, recipe);
  });
}

export function goToRecipe(e) {
  const selectedRecipe = e.target.closest('div');
  recipeData.forEach(recipe => {
    if (Number(selectedRecipe.id) === recipe.id) {
      currentRecipe = recipe;
      toggleAddRemoveSavedBtns();
      renderRecipeView();
      renderRecipeTitle(recipe);
      renderRecipeCost(recipe);
      renderRecipeImg(recipe);
      renderRecipeInstructions(recipe);
      renderRecipeIngredients(recipe);
    }
  });
  return currentRecipe;
}

function renderRecipeTitle(recipe) {
  recipeTitle.innerText = '';
  recipeTitle.innerText = recipe.name;
}

function renderRecipeCost(recipe) {
  const estimatedCost = calcRecipeCost(recipe, ingredientsData);
  recipeCost.innerText = '';
  recipeCost.innerText += `estimated cost | $${estimatedCost}`;
}

function renderRecipeImg(recipe) {
  recipeImage.innerHTML = `<img src=${recipe.image} >`;
}

function renderRecipeInstructions(recipe) {
  recipeInstructions.innerHTML = '';
  recipe.instructions.forEach(instruction => {
    recipeInstructions.innerHTML += `<li class="recipe-details">${instruction.number}. ${instruction.instruction}</li>`;
  });
}

function renderRecipeIngredients(recipe) {
  recipeIngredients.innerHTML = '';
  const ingredientsToRender = formatRecipeIngredients(recipe, ingredientsData);
  ingredientsToRender.forEach(({ name, amount, unit }) => {
    recipeIngredients.innerHTML += `<li class="recipe-details">${name} | ${amount} ${unit}</li>`;
  });
}

function renderSavedRecipes(e) {
  const click = e.target.closest('a');
  if (click.id === 'viewSavedBtn') {
    renderSavedView();
    recipesContainer.innerHTML = '';
    recipesToCook.forEach(recipe => {
      renderRecipeCard(recipesContainer, recipe);
    });
  }
}

function openPrintModal() {
  const printRecipeTitle = document.getElementById('printRecipeTitle');
  const printRecipeIngredients = document.getElementById('printRecipeIngredients');
  const printRecipeInstructions = document.getElementById('printRecipeInstructions');

  printRecipeTitle.innerText = currentRecipe.name;

  const ingredientsToRender = formatRecipeIngredients(currentRecipe, ingredientsData);
  printRecipeIngredients.innerHTML = '';
  ingredientsToRender.forEach(({ name, amount, unit }) => {
    printRecipeIngredients.innerHTML += `<li>${name} | ${amount} ${unit}</li>`;
  });

  printRecipeInstructions.innerHTML = '';
  currentRecipe.instructions.forEach(instruction => {
    printRecipeInstructions.innerHTML += `<li>${instruction.number}. ${instruction.instruction}</li>`;
  });

  printModalDisplay.style.display = 'flex';
}

function closePrintModal() {
  printModalDisplay.style.display = 'none';
}

function printPage() {
  print();
  closePrintModal();
}

function renderRecipeCard(container, recipe) {
  container.innerHTML += `
      <div class="recipe-card" id=${recipe.id}>
        <img src=${recipe.image} alt="Recipe Image">
        <p class="recipe-name">${recipe.name}</p>
      </div>`;
}

function renderSearchResult() {
  toRecipeContainer.classList.add('hidden');
  homeContainer.classList.add('hidden');
  recipesContainer.classList.remove('hidden');
  viewSavedBtn.classList.remove('hidden');
}

function renderHomeView() {
  recipesContainer.classList.add('hidden');
  toRecipeContainer.classList.add('hidden');
  homeContainer.classList.remove('hidden');
  saveRecipeBtn.classList.add('hidden');
  viewSavedBtn.classList.remove('hidden');
  removeSavedRecipeBtn.classList.add('hidden');
  searchSavedContainer.classList.add('hidden');
  homeTitle.classList.remove('hidden');
}

function renderSavedView() {
  toRecipeContainer.classList.add('hidden');
  recipesContainer.classList.remove('hidden');
  removeSavedRecipeBtn.classList.add('hidden');
  saveRecipeBtn.classList.add('hidden');
  viewSavedBtn.classList.add('hidden');
  homeContainer.classList.add('hidden');
  searchSavedContainer.classList.remove('hidden');
  homeTitle.classList.add('hidden');
}

function renderAllRecipesView() {
  toRecipeContainer.classList.add('hidden');
  recipesContainer.classList.remove('hidden');
  allRecipesBtn.classList.remove('hidden');
  homeContainer.classList.add('hidden');
  saveRecipeBtn.classList.add('hidden');
  viewSavedBtn.classList.remove('hidden');
  removeSavedRecipeBtn.classList.add('hidden');
  searchSavedContainer.classList.add('hidden');
  homeTitle.classList.add('hidden');
}

function renderRecipeView() {
  homeContainer.classList.add('hidden');
  viewSavedBtn.classList.remove('hidden');
  toRecipeContainer.classList.remove('hidden');
  recipesContainer.classList.add('hidden');
  searchSavedContainer.classList.add('hidden');
  homeTitle.classList.add('hidden');
}

function toggleAddRemoveSavedBtns() {
  if (recipesToCook.includes(currentRecipe)) {
    removeSavedRecipeBtn.classList.remove('hidden');
    saveRecipeBtn.classList.add('hidden');
  } else {
    removeSavedRecipeBtn.classList.add('hidden');
    saveRecipeBtn.classList.remove('hidden');
  }
}