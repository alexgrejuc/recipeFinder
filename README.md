# Recipe Finder! 

### Continued work on a web app originally made for the final project in CS290 at OSU taught by Dr. Rob Hess in Spring 2018. 

On the main page, users can add ingredients which they have lying around the house. 

Then, by clicking generate, they will be redirected to a new page which has up to ten recipes that most closesly match the ingredients they entered, in order from left to right by closesness [1]. 

Finally, clicking on a recipe tile on the generated recipes page takes the user to a third page which displays all of the details of the recipe (including attribution).

[Try it out!](https://recipe-finder-osu.herokuapp.com/home.html) 

Note: the search suggest and user input currently do not align. Also, there is a bug which does not allow a user to type ingredient names after clicking outside the search bar. Both issues will hopefully be fixed soon. 

:spaghetti:       <br>
:pizza:           <br>
:ramen:           <br> 
:fork_and_knife:  <br> 
:sushi:           <br> 
:bread:           <br> 
:hamburger:       <br>

[1] The closesness factor is determined by two things: the number of ingredients in the recipe which match what the user entered (1 point is added) and the number of extra ingredients in the recipe which the user did not enter (1 point is subtracted). 



