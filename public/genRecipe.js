//client side JS for generate recipe page


//add Generated Recipes in from database
// function insertRecipe(recipeName, recipeTime, recipeImg) {
//
//   var recipeTemplate = Handlebars.templates.recipe;
//   var newRecipeHTML = recipeTemplate({
//     Name: recipeName,
//     time: recipeTime,
//     image: recipeImg
//   });
//
//   var recipeContainer = document.querySelector('main.recipe-container');
//
//   recipeContainer.insertAdjacentHTML('beforeend', newRecipeHTML);
// }

function renderDetails(event){
  var container = event.target;
  var text = container.querySelector('.recipe-name').innerText;
    console.log("Chosen Recipe: ", text);

  if(text) {
    console.log("here");
    var recipeURL = "recipeDetails/" + text;

    window.location.href = recipeURL;



    // request.onload = function(){
    //   console.log(request.status);
    //   if(request.status === 200){
    //     window.location.href = recipeURL;
      // }
    // }
  }
}

var recipeContainer = document.getElementsByClassName('recipe-container')[0];

recipeContainer.addEventListener('click', function(event) {
    if(event.target.classList.contains("recipe-text")) {
        console.log("clicked");
        renderDetails(event);
    }
});
