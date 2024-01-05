export const getPromises = [
  fetch('http://localhost:3001/api/v1/recipes')
  .then(res => {
    if(!res.ok) {
      throw new Error()
    }
    return res.json();
  }),
  fetch('http://localhost:3001/api/v1/ingredients')
  .then(res => {
    if(!res.ok) {
      throw new Error()
    }
    return res.json()
  }),
  fetch('http://localhost:3001/api/v1/users')
  .then(res => {
    if(!res.ok) {
      throw new Error()
    }
    return res.json()
  }),
  // fetch('http://localhost:3001/api/v1/usersRecipes')
  // .then(res => {
  //   if(!res.ok) {
  //     throw new Error()
  //   }
  //   return res.json()
  // })
];

export const postUrl = 'http://localhost:3001/api/v1/usersRecipes';


