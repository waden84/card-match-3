"use strict";

var difficulty = localStorage.getItem("difficulty");

if (difficulty === null) {difficulty = "1"}

var num_pokemon;
var num_cols;
var num_rows = 4;

switch (difficulty) {
    case "1":
        num_pokemon = 6;
        --num_rows;
        break;
    case "2":
        num_pokemon = 10;
        break;
    case "3":
        num_pokemon = 16;
        break;
    case "4":
        num_pokemon = 20;
        break;
};

num_cols = (num_pokemon*2)/num_rows;

var image_names = [
"bulbasaur",
"caterpie",
"charizard",
"charmander",
"diglett",
"eevee",
"jigglypuff",
"leafon",
"meowth",
"mew",
"pidgey",
"pikachu",
"piplup",
"snorlax",
"squirtle",
"vileplume",
"psyduck",
"magikarp",
"ditto",
"mewtwo"
];

shuffle(image_names)
image_names = image_names.slice(0,num_pokemon);
image_names = [...image_names, ...image_names];
shuffle(image_names)

image_names.map(image_name=>
    document.write(
        `
        <div class="card">
            <div class="back">
                <div class="up"><img class="card_img" src="images/pokeballs.jpg" alt=""></div>
            </div>
            <div class="front">
                <div class="down"><img class="card_img" src="images/${image_name}.jpg" alt=""></div>
            </div>
        </div>
        `
    )
);


for (var i = 0; i < 4; ++i) {
    var cel_img = (i <= 1 ? "ash": "team_rocket");
    var cel_color = (i <= 1 ? "blue": "magenta");
    document.write(
        `
        <div class="celebration_card" id="celebration${i}">
            <div class="celebration_outer">
                <div class="celebration_inner">
                    <img class="celebration_img" 
                    style="border-color:${cel_color};"
                    src="images/${cel_img}.jpg" alt="">
                </div>
            </div>
        </div>
        `
    );
}

var cards = document.getElementsByClassName("card");

var icon = `<img src="images/pokeball_icon.ico" class="pokeball_icon" alt="">&nbsp;`;
document.write(`<button type="button" class="buttons" id="reset">${icon}New Game${icon}</button>`);

document.getElementById("reset").addEventListener("click",()=> window.location.href = "index.html");

document.write(`<img src="images/pokeball_icon.ico" style="left:105px" class="pokeball_icon2" alt="">`);
document.write(`<img src="images/pokeball_icon.ico" style="left:525px" class="pokeball_icon2" alt="">`);

document.write(`<div class="score" id="human_score">Your Score: 0</div>`);
document.write(`<div class="score" id="computer_score">Computer Score: 0</div>`);

var prev_card = null;
var computer_data = {};
var game_state = {click_resolved : true, human_turn: true}

if (Math.random() < .5) {
    game_state.human_turn = false;
}

update_turn_icon();

var human_score = 0;
var computer_score = 0;
var unmatched_cards = [num_pokemon*2];

for(var i = 0, j = -1 ; i < cards.length; ++i) {
    i % num_cols === 0 ? j++ : j;
    
    cards[i].style.left = ((i % num_cols)*(200+25)+100) + "px";
    cards[i].style.top = (j*(270+25)+100) + "px";
    cards[i].setAttribute("id","pokemon" + (i+1));
    unmatched_cards[i+1] = 1;

    cards[i].getElementsByClassName("down")[0].style.visibility = "hidden";

    cards[i].addEventListener("click",(e)=>{
        var card = e.currentTarget;
         if (game_state.human_turn) {
            click_function(card);
        }
    })
}

function click_function(card) {
    var back_is_up = card.getElementsByClassName("back")[0].getElementsByClassName("up").length === 1;
    if (back_is_up && game_state.click_resolved) {
        (async () => {
            game_state.click_resolved = false;
            await flipCard(card);
            await update_computer_data(card);
            await check_matching(card);
            game_state.click_resolved = true;
        })()
    }
};

function flipCard(card) {
    var up = card.getElementsByClassName("up")[0];
    var down = card.getElementsByClassName("down")[0];
    up.className = "down";
    return new Promise(resolve => {
        setTimeout(()=>{
            up.style.visibility = "hidden";
            down.style.visibility = "visible";

            down.className = "up";
            setTimeout(()=>{
                resolve();
            },650);

        },650);
    });
}

function check_matching(curr_card) {
    return new Promise(resolve => {
    var curr_card_name = get_card_name(curr_card);
    var prev_card_name = get_card_name(prev_card);

        if (prev_card_name === "") {
                prev_card = curr_card;
                resolve();
        }
        else if (prev_card_name === curr_card_name) {
            setTimeout(()=>{
                remove_card(curr_card);
                remove_card(prev_card);
                show_celebration(curr_card,prev_card)
                    .then(()=>show_celebration(curr_card,prev_card))
                    .then(()=>show_celebration(curr_card,prev_card))
                    .then(()=>{
                        prev_card = null;
                        (game_state.human_turn ? human_score++ : computer_score++);
                        update_scores();
                        resolve()});
            },1000);
        }
        else {
            setTimeout(()=>{
                flipCard(curr_card);
                flipCard(prev_card)
                .then(()=>{
                    prev_card = null;
                    game_state.human_turn = !game_state.human_turn;
                    update_turn_icon();
                    resolve()});
            },1000);
        }
    });
}

function get_card_name(card) {
    var card_name;
    if (card === null) {
        card_name = "";
    }
    else {
        var imgFileName = card.getElementsByTagName("img")[1].src.split("/");
        card_name = imgFileName[imgFileName.length-1].split(".")[0];
    }
    return card_name;
}

function remove_card (card) {
    // way 1:
    card.style.visibility = "hidden";
    card.getElementsByTagName("img")[1].style.visibility = "hidden";
    // way 2:
    // card.style.display = "none";
}

function show_celebration(card1,card2) {
    return new Promise(resolve => {
        var cel_inner_elements = document.getElementsByClassName("celebration_inner");
        var i = 0;
        if (!game_state.human_turn) {i += 2};

        document.getElementById(`celebration${i}`).style.top = card1.style.top;
        document.getElementById(`celebration${i}`).style.left = card1.style.left;
        document.getElementById(`celebration${i+1}`).style.top = card2.style.top;
        document.getElementById(`celebration${i+1}`).style.left = card2.style.left;
        
            setTimeout(()=> {
                cel_inner_elements[i].style.opacity="100%";
                cel_inner_elements[i+1].style.opacity="100%";

                setTimeout(()=> {
                    cel_inner_elements[i].style.transition = "opacity 0";
                    cel_inner_elements[i].style.opacity="0%";
                    cel_inner_elements[i+1].style.transition = "opacity 0";
                    cel_inner_elements[i+1].style.opacity="0%";
                    resolve();
                },200);
        },200);
    });
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

function update_computer_data(card) {
    
    return new Promise(resolve => {

        var card_name = get_card_name(card);
        var prev_card_name = get_card_name(prev_card);

        if (prev_card_name === card_name) {
            if (card_name in computer_data) {
                unmatched_cards[parseInt(card.id.replace("pokemon",""))]=0;
                unmatched_cards[parseInt(prev_card.id.replace("pokemon",""))]=0;
                unmatched_cards[0] -= 2;
                delete computer_data[card_name];
            }
        }
        else {
            var card_num = parseInt(card.id.replace("pokemon",""));

            /*
            Computer data for each card name has a array of size 2
            Each number represent a possible card location for that pokemon
            A '-1' value indicates unknown card position
            Not all these cases below are necessary but just went ahead and put all possible combinations
            Both elements of the array can take on the following values: -1, card location 1, card location 2
            
            -1, -1             =>  (first -1 becomes current_card)       =>  current_card, -1
            -1, other_card     =>  (-1 becomes current_card)             =>  current_card, other_card
            -1, current_card   =>  (swap -1 and current_card positions)  =>  current_card, -1

            other_card, -1            =>  (-1 becomes current_card)            =>  other_card, current_card
            other_card, other_card    =>  (2nd position becomes current_card)  =>  other_card, current_card
            other_card, current_card  =>  (do nothing)                         =>  other_card, current_card
            
            current_card, -1            =>  (do nothing)               =>  current_card, -1
            current_card, other_card    =>  (do nothing)               =>  current_card, other_card
            current_card, current_card  =>  (2nd position becomes -1)  =>  current_card, -1
            */

            if (card_name in computer_data) {

                var cd0 = computer_data[card_name][0];
                var cd1 = computer_data[card_name][1];

                if (cd0 === -1) {
                    if (cd1 === -1) {
                        computer_data[card_name][0] = card_num;
                    }
                    else if (cd1 !== -1 && cd1 !== card_num) {
                        computer_data[card_name][0] = card_num;
                    }
                    else if (cd1 === card_num) {
                        computer_data[card_name][0] = card_num;
                        computer_data[card_name][1] = -1;
                    }
                }
                else if (cd0 !== -1 && cd0 !== card_num) {
                    if (cd1 === -1) {
                        computer_data[card_name][1] = card_num;
                    }
                    else if (cd1 !== -1 && cd1 !== card_num) {
                        computer_data[card_name][1] = card_num;
                    }
                    else if (cd1 === card_num) {
                        // do nothing //
                    }
                }
                else if (cd0 === card_num) {
                    if (cd1 === -1) {
                        // do nothing //
                    }
                    else if (cd1 !== -1 && cd1 !== card_num) {
                        // do nothing //
                    }
                    else if (cd1 === card_num) {
                        computer_data[card_name][1] = -1;
                    }
                }   
            }
            else {

                computer_data[card_name] = [card_num, -1];
            }
        }
        resolve();
    });
}

setTimeout(()=>computer_action(),2000);

var computerPolling;

function computer_action() {
    computerPolling = 
    setInterval(()=>{
        if (unmatched_cards[0]<=0) {
            clearInterval(computerPolling);
        }
        if (!game_state.human_turn && game_state.click_resolved && unmatched_cards[0]>0) {
            var selected_card;

            var card_list = {};
            var random_card_num;
            if (prev_card === null) {

                var found_double=false;
                for (var card_name in computer_data) {

                    if (computer_data[card_name][1] !== -1) {
                        selected_card = document.getElementById("pokemon" + computer_data[card_name][1]);
                        found_double = true;
                        break;
                    }
                    card_list[computer_data[card_name][0]]=0;
                }
                if (!found_double) {

                    do {random_card_num = Math.ceil(Math.random()*num_pokemon*2);
                    }
                    while(random_card_num in card_list || unmatched_cards[random_card_num] === 0)

                    selected_card = document.getElementById("pokemon" + random_card_num);
                }
            }
            else {
                var prev_card_name = get_card_name(prev_card);
                if (computer_data[prev_card_name][1] !== -1) {
                    parseInt(prev_card.id.replace("pokemon","")) === computer_data[prev_card_name][0] 
                        ? selected_card = document.getElementById("pokemon" + computer_data[prev_card_name][1])
                        : selected_card = document.getElementById("pokemon" + computer_data[prev_card_name][0])
                }
                else {
                    for (var card_name in computer_data) {
                        card_list[computer_data[card_name][0]]=0;
                    }

                    do {random_card_num = Math.ceil(Math.random()*num_pokemon*2);
                    }
                    while(random_card_num in card_list || unmatched_cards[random_card_num] === 0)

                    selected_card = document.getElementById("pokemon" + random_card_num);
                }
            }
            click_function(selected_card);
        }
    },500);
    
};

function update_turn_icon () {
    if (game_state.human_turn) {
        document.getElementsByClassName("pokeball_icon2")[0].style.visibility = "visible";
        document.getElementsByClassName("pokeball_icon2")[1].style.visibility = "hidden";
        document.getElementById("human_score").style.border = "solid red 5px";
        document.getElementById("computer_score").style.border = "solid black 2px";
    }
    else {
        document.getElementsByClassName("pokeball_icon2")[1].style.visibility = "visible";
        document.getElementsByClassName("pokeball_icon2")[0].style.visibility = "hidden";
        document.getElementById("computer_score").style.border = "solid red 5px";
        document.getElementById("human_score").style.border = "solid black 2px";
    }
};

function update_scores () {
    document.getElementById("human_score").textContent = `Your Score: ` + human_score;
    document.getElementById("computer_score").textContent = `Computer Score: ` + computer_score;
}