const inquirer = require("inquirer");
const library = require("./cardLibrary.json");
const BasicCard = require("./BasicCard.js")
const ClozeCard = require("./ClozeCard.js")
const colors = require('colors');
const fs = require("fs");

var drawnCard;
var playedCard;
var count = 0;

//initially give option to the user to Create new flashcards or use exiting ones.
function openMenu() {
  inquirer.prompt([															
      {
          type: "list",														
          message: "\nPlease choose a menu option from the list below?",	
          choices: ["Create", "Use All", "Random", "Shuffle", "Show All", "Exit"],	
          name: "menuOptions"												
      }
  ]).then(function (answer) {												
    var waitMsg;

    switch (answer.menuOptions) {

        case 'Create':
            console.log("Ok lets make a new flashcard...");
            waitMsg = setTimeout(createCard, 1000);
            break;

        case 'Use All':
            console.log("OK lets run through the deck...");
            waitMsg = setTimeout(askQuestions, 1000);
            break;

        case 'Random':
            console.log("OK I'll pick one random card from the deck...");
            waitMsg = setTimeout(randomCard, 1000);
            break;

        case 'Shuffle':
            console.log("OK I'll shuffle all the cards in the deck...");
            waitMsg = setTimeout(shuffleDeck, 1000);
            break;

        case 'Show All':
            console.log("OK I'll print all cards in the deck to your screen...");
            waitMsg = setTimeout(showCards, 1000);
            break;

        case 'Exit':
            console.log("Thank you for using the Flashcard-Generator")
            return;
            break;

        default:
            console.log("");
            console.log("Sorry I don't understand");
            console.log("");
    }

  });

}

openMenu();

//If the choice is to create a card then this function will run
function createCard() {
    inquirer.prompt([
        {
            type: "list",
            message: "What type of flashcard do you want to create?",
            choices: ["Basic Card", "Cloze Card"],
            name: "cardType"
        }

    ]).then(function (appData) {

        var cardType = appData.cardType;  			
        console.log(cardType);			  			

        if (cardType === "Basic Card") {
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please fill out the front of your card (Your Question).",
                    name: "front"
                },

                {
                    type: "input",
                    message: "Please fill out the back of your card (Your Answer).",
                    name: "back"
                }

            ]).then(function (cardData) {

                var cardObj = {						
                    type: "BasicCard",
                    front: cardData.front,
                    back: cardData.back
                };
                library.push(cardObj);				
                fs.writeFile("cardLibrary.json", JSON.stringify(library, null, 2)); 

                inquirer.prompt([					
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function (appData) {				
                    if (appData.anotherCard === "Yes") {	
                        createCard();						
                    } else {								
                        setTimeout(openMenu, 1000);			
                    }
                });
            });

        } else {						 
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please type out the full text of your statement (remove cloze in next step).",
                    name: "text"
                },

                {
                    type: "input",
                    message: "Please type the portion of text you want to cloze, replacing it with '...'.",
                    name: "cloze"
                }

            ]).then(function (cardData) {            
                var cardObj = {						
                    type: "ClozeCard",
                    text: cardData.text,
                    cloze: cardData.cloze
                };
                if (cardObj.text.indexOf(cardObj.cloze) !== -1) {   
                    library.push(cardObj);							
                    fs.writeFile("cardLibrary.json", JSON.stringify(library, null, 2)); 
                } else {											
                    console.log("Sorry, The cloze must match some word(s) in the text of your statement.");

                }
                inquirer.prompt([					 
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function (appData) {				
                    if (appData.anotherCard === "Yes") {	
                        createCard();						
                    } else {								
                        setTimeout(openMenu, 1000);		
                    }
                });
            });
        }

    });
};

//function used to get the question from the drawnCard in the askQuestions function
function getQuestion(card) {
    if (card.type === "BasicCard") {						
        drawnCard = new BasicCard(card.front, card.back);	
        return drawnCard.front;								
    } else if (card.type === "ClozeCard") {					
        drawnCard = new ClozeCard(card.text, card.cloze)	 
        return drawnCard.clozeRemoved();					 
    }
};

//function to ask questions from all stored card in the library
function askQuestions() {
    if (count < library.length) {					
        playedCard = getQuestion(library[count]);	
        inquirer.prompt([							
            {
                type: "input",
                message: playedCard,
                name: "question"
            }
        ]).then(function (answer) {					
        	//if the users answer equals .back or .cloze of the playedCard run a message "You are correct."
            if (answer.question === library[count].back || answer.question === library[count].cloze) {
                console.log(colors.green("You are correct."));
            } else {
            	
                if (drawnCard.front !== undefined) { 
                    console.log(colors.red("Sorry, the correct answer was ") + library[count].back + "."); 
                } else { 
                    console.log(colors.red("Sorry, the correct answer was ") + library[count].cloze + "."); 
                }
            }
            count++; 		
            askQuestions(); 
        });
    } else {
      	count=0;			
      	openMenu();			
    }
};

function shuffleDeck() {
  newDeck = library.slice(0); 
  for (var i = library.length - 1; i > 0; i--) { 

      var getIndex = Math.floor(Math.random() * (i + 1));
      var shuffled = newDeck[getIndex];

      newDeck[getIndex] = newDeck[i];

      newDeck[i] = shuffled;
  }
  fs.writeFile("cardLibrary.json", JSON.stringify(newDeck, null, 2)); 
  console.log(colors.cyan("The deck of flashcards have been shuffled"));
  
}

//function to ask question from a random card
function randomCard() {
  var randomNumber = Math.floor(Math.random() * (library.length - 1));  

  playedCard = getQuestion(library[randomNumber]);	
        inquirer.prompt([							
            {
                type: "input",
                message: playedCard,
                name: "question"
            }
        ]).then(function (answer) {					
        	//if the users answer equals .back or .cloze of the playedCard run a message "You are correct."
            if (answer.question === library[randomNumber].back || answer.question === library[randomNumber].cloze) {
                console.log(colors.green("You are correct."));
                setTimeout(openMenu, 1000);
            } else {
            	
                if (drawnCard.front !== undefined) { 
                    console.log(colors.red("Sorry, the correct answer was ") + library[randomNumber].back + "."); 
                    setTimeout(openMenu, 1000);
                } else { 
                    console.log(colors.red("Sorry, the correct answer was ") + library[randomNumber].cloze + ".");
                    setTimeout(openMenu, 1000);
                }
            }
        });

};

//function to print all cards on screen for user to read through
function showCards () {

  var library = require("./cardLibrary.json");

  if (count < library.length) {                     
    //currentCard = getQuestion(library[count]);      

    if (library[count].front !== undefined) { 
        console.log("");
        console.log(colors.yellow("++++++++++++++++++ Basic Card ++++++++++++++++++"));
        console.log(colors.yellow("++++++++++++++++++++++++++++++++++++++++++++++++"));
        console.log("Front: " + library[count].front); 
        console.log("------------------------------------------------");
        console.log("Back: " + library[count].back + "."); 
        console.log(colors.yellow("++++++++++++++++++++++++++++++++++++++++++++++++"));
        console.log("");

    } else { 
        console.log("");
        console.log(colors.yellow("++++++++++++++++++ Cloze Card ++++++++++++++++++"));
        console.log(colors.yellow("++++++++++++++++++++++++++++++++++++++++++++++++"));
        console.log("Text: " + library[count].text); 
        console.log("------------------------------------------------");
        console.log("Cloze: " + library[count].cloze + "."); 
        console.log(colors.yellow("++++++++++++++++++++++++++++++++++++++++++++++++"));
        console.log("");
    }
    count++;		
    showCards();	
  } else {
    count=0;		
    openMenu();		
  }
}