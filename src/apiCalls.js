const getPromises = [
  fetch('http://localhost:3001/api/v1/recipes'),
  fetch('http://localhost:3001/api/v1/ingredients'),
  fetch('http://localhost:3001/api/v1/users')
];

export const postUrl = 'http://localhost:3001/api/v1/usersRecipes';

export const fetchData = () => {
  return Promise.all(getPromises);
}



