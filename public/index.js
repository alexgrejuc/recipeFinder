
var searchInput = document.getElementsByClassName("search-input")[0];
var genButton = document.getElementById("generate-recipes-button");
var ingredientNames = document.getElementsByClassName("ingredient-name");
var suggestedIngredient = document.getElementById("suggested-ingredient");
var suggestedIngredients;

function setFocus()
{
	console.log("focused");
	document.getElementById("navbar-search-input").focus();
}

var request = new XMLHttpRequest();
request.open('GET', "/requestIngredients");
request.send();

request.onreadystatechange = function (){
    if(request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            var ingredientsObject = JSON.parse(request.response);
            suggestedIngredients = ingredientsObject.ingredients;
            console.log("received: ", suggestedIngredients);
        }
    }
}

//sends user search query to database, adds to ingredients-container if successful
function searchAddIngredient(){
  //var query = searchInput.value;

    var query;
  if(suggestedIngredient.innerText.length > 0 ) query = suggestedIngredient.innerText;
  else query = searchInput.value;
  var query_URL = "/search/" + query;

  console.log(query_URL);

  //this is actually probably dangerous, but it works for now
  //I'm sure someone could mess with the DB by sending the right commands to it
  var request = new XMLHttpRequest();
  request.open('GET', query_URL);
  request.send();

  request.onload = function (){
    console.log(request.status);
    if(request.status === 200)
	{
		addIngredient(query); //add ingredient to container if successful search
	}
	else
	{
		document.getElementById("main-search").style.border = "8px solid red";
		document.getElementsByClassName("search-input")[0].placeholder = "Entered unknown ingredient. Please try again.";

		// revert back to normal on entered text
		document.getElementsByClassName("search-input")[0].addEventListener("input", function()
		{
			document.getElementById("main-search").style.border = "8px solid #793345";
			document.getElementsByClassName("search-input")[0].placeholder = "add an ingredient...";
		});
	}
  };
}

//adds ingredient to next slot in the ingredients-container
function addIngredient(name){
  var ingredientTemplate = Handlebars.templates.ingredient;

  var ingredientHTML = ingredientTemplate ({
    ingredientName: name
  });

  var ingredientsContainer = document.querySelector('#ingredients-container');

  ingredientsContainer.insertAdjacentHTML('beforeend', ingredientHTML);

  //adds delete listener to X
  var xbutton = ingredientsContainer.getElementsByClassName("remove-ingredient-button");
  var xl = xbutton.length;
  xbutton[xl - 1].addEventListener('click', function(){removeIngredient(name);});

}

//finds and removes ingredient tag
function removeIngredient(name)
{
	var tags = document.getElementsByClassName("mainpage-ingredient");
	var l = tags.length;
	var i;
	for (i = 0; i < l; i++)
	{
		var iname = tags[i].getElementsByClassName("ingredient-name")[0].innerHTML;

		if (iname === name)
		{
			var rItem = document.getElementsByClassName("mainpage-ingredient")[i];
			document.getElementById("ingredients-container").removeChild(rItem);
		}
	}
}

function updateSuggestedIngredient(){
	  var input = searchInput.value;

		for(var i = 0; i < suggestedIngredients.length; i++){
			if(suggestedIngredients[i].indexOf(input) === 0 && input.length > 0){
				suggestedIngredient.innerText = suggestedIngredients[i];
				break;
			}
		}
}

//listens for enter key press on search
searchInput.addEventListener('keyup', function(event){
	//event.preventDefault(); //do nothing unless enter was pressed

    suggestedIngredient.innerText = "";
	updateSuggestedIngredient();
	if(event.keyCode === 13){ //13 is the enter key
    searchAddIngredient();
    searchInput.value = "";
  }
});

//Sends all of the user-entered ingredients to the server
//Generates an array of the recipes on the server side
//This array will be used to dynamically generate the recipes page
function generateRecipes(){
  console.log("Num ingredients: ", ingredientNames.length);

  //used in a GET request to send ingredient names to server
  var ingredientNamesString = "recipesWith/";
  for (var i = 0; i < ingredientNames.length - 1; i++){
    ingredientNamesString += ingredientNames[i].textContent + ",";
  }

  //This is done to avoid the extra comma at the end
  ingredientNamesString += ingredientNames[ingredientNames.length - 1].textContent;

  console.log(ingredientNamesString);

  //first send the ingredient names to the server
  var request = new XMLHttpRequest();
  request.open('GET', ingredientNamesString);
  request.send();

  request.onload = function (){
    console.log(request.status);
    if(request.status === 200){
      window.location.href = "/genRecipe";
    }
  };
}

genButton.addEventListener('click', generateRecipes);
