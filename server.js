/******************************************************************************
**
** Server code for recipeFinder
**
**
**
** To use:
**          run "npm install" to install necessary modules
**          run "npm start" to run normally (also compiles handlebars)
**          run "npm run dev" to run with nodemon (also compiles handlebars)
**
**
******************************************************************************/

//Ensure these dependencies are all installed in node_modules
//These can be installed by running npm install (assuming you have the package.json from this repo)
var path = require('path');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var exphbs = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000; //use environment variable if set

//These are populated when the server is first started
var ingredientsArray;   //all of the ingredients, sorted & w/o duplicates
var recipesMongoObject; //all of the recipes from the DB, as a Mongo object (contains a lot of unnecessary info)
var allRecipesArray;    //all of the recipes w/o extra Mongo fields

//this is populated when the user clicks generate
var generatedRecipes; //only the recipes that match the user-entered ingredients

app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

const uri = "mongodb+srv://recipeFinderUser:readOnly@recipe-finder-cluster-0-1aiyg.mongodb.net"

console.log("\n=== Attempting to connect to DB: ", uri, "===");
const client = new MongoClient(uri, { useNewUrlParser: true });

// Server eventually crashes if DB connection takes too long / does not work
// This will populate all of the necessary info (such as recipes and ingredients) if DB connection succeeds
client.connect(err => {
	  recipesMongoObject = client.db("recipeFinderDB").collection("recipes");
	    var recipesCursor = recipesMongoObject.find({}).project({_id: 0});

		ingredientsArray = [];

		recipesCursor.toArray(function(err, allRecipes){
			if(err){
				res.status(500).send("Error fetching from DB");
			}
			else{ //create array of all recipes, sorted set (i.e. no duplicates) of all ingredients

				allRecipesArray = allRecipes;

				//make an array of ingredients
				allRecipesArray.forEach(function (element){
					element.ingredients.forEach(function (ingredient){
						ingredientsArray.push(ingredient);
					});

				});

				ingredientsArray.sort();

				//remove duplicates
				//probably not efficient
				ingredientsArray = ingredientsArray.filter(function(elem, index, arr) {
						return index === arr.indexOf(elem);
				});


				console.log("\n=== Server got the following ingredients list from the DB:\n", ingredientsArray, "\n===");

			}}); 
		
		app.listen(port, function () {
        console.log("\n=== Server listening on port ", port, " (successfully connected to DB)", "===");
    });
 
	//client.close();
});

app.get('/requestIngredients', function (req, res, next){
    console.log("\n=== Ingredients requested ===");

    var response = { "ingredients": ingredientsArray};

    if(ingredientsArray.length > 0) {
        res.status(200);
        res.send(response);
    }
});

//This is triggered when a user enters an ingredient on the main search bar
app.get('/search/:ingredient', function (req, res, next){
    console.log("\n=== Ingredient searched: ", req.params.ingredient, " ===");

    //Checks if the ingredient exists in the DB
    if(ingredientsArray.indexOf(req.params.ingredient) != -1){
        res.status(200).send(req.params.ingredient);
    } else {
       res.status(404).send();
    }
});

//really this should be in a separate module
function scoreRecipes(recipeScores, ingredients, validRecipes){

    //This is quick and dirty
    //Needs to be cleaned up and refactored
    validRecipes.forEach(function (element) {
        var score = 0;

        element.ingredients.forEach(function (ingredient){
                if(ingredients.indexOf(ingredient) >= 0){
                    score++;
                }
                else {
                    score--;
                }
        });

        recipeScores.push({"recipe": element, "score": score});
    });

    recipeScores.sort(function(a, b){
        if(a.score > b.score) return -1;
        else if(b.score > a.score) return 1;
        else return 0;
    });

    console.log("\n=== scored recipes as follows:\n", recipeScores, "\n===");
}

//Get request that is created when user clicks generate button on the main page
app.get('/recipesWith/:ingredients', function (req, res, next){

    //Turn the parameter string into an array of the ingredient names
    var ingredients = req.params.ingredients.split(',');
    console.log("\n===Searching for recipes with ingredient names:\n", ingredients, "\n===");

    //Searches database to find any recipe that contains one or more of the ingredients entered by the user
    var recipeCursor = recipesMongoObject.find({"ingredients": {$in: ingredients}}).project({_id: 0});

    //namesCursor is a database object, this attempts to turn it into an array
    recipeCursor.toArray(function (err, validRecipes) {
        if(err){
            res.status(500).send("Error fetching from DB");
        } else {


            generatedRecipes = [];

            var recipeScores = [];

            scoreRecipes(recipeScores, ingredients, validRecipes);

            for(var i = 0; i < recipeScores.length && i < 12 ; i++){
                generatedRecipes[i] = recipeScores[i].recipe;
            }

            console.log("\n=== Using the following (should be 12 or fewer) recipes:\n", generatedRecipes, "\n===");

            res.status(200).send(); //index.js listens for this and routes to genRecipe when received
       }
    });

});

//Automatically routes here after the recipes are generated
//Routed via the javascript in index.js following a 200 response from the server
app.get('/genRecipe', function(req, res, next){

    //prevents undefined behavior if a user tries to bypass recipe generation to get to this page
    if(generatedRecipes){
        //This is just for printing to the console
        var names = "";

        generatedRecipes.forEach(function(element){
            names += element.name + ", ";
        });
        names = names.slice(0, -2); //remove the last comma so it doesn't seem like a recipe is missing

        console.log("\n=== Server generating genRecipe page with the following recipes:\n", names, "\n===");
        res.status(200).render('genRecipe', {
            recipes: generatedRecipes,
            genRecipeJS: true
        });
    }
    else next();
});

//This will render the recipe details page
//Can either route here by clicking on a recipe tile on the genRecipe page
//Or by directly entering the URL
app.get('/recipeDetails/:recipeName', function(req, res, next){

    var found = 0;

    allRecipesArray.find(function(recipeObject) {
        if(recipeObject.name == req.params.recipeName) {
            console.log("\n=== Rendering recipe details with:\n", recipeObject, "\n===");
            res.status(200).render('fullRecipePage', {
                name: recipeObject.name,
                photoURL: recipeObject.photoURL,
                ingredientsLong: recipeObject.ingredientsLong,
                time: recipeObject.time,
                directions: recipeObject.directions,
                link: recipeObject.link,
                courtesyOf: recipeObject.courtesyOf,
                genRecipeJS: false
            });

           found = 1;
        }

    });

    if(!found) next();
});


app.use(express.static('public'));

//It would be nice to have an appropriately-styled 404 page, but it's not necessary
app.get('*', function (req, res) {
        res.status(404).render('404');
});
