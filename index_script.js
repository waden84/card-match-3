"use strict";

var icon = `<img src="images/pokeball_icon.ico" class="pokeball_icon" alt="">&nbsp;`;

document.write(
    `
    <div id="button_container">
        <h1>Pokemon Matching Game</h1>
        <h2>Choose your difficulty:</h1>
        <p><button type="button" class="buttons" id="button1">${icon}Easy</button></p>
        <p><button type="button" class="buttons" id="button2">${icon}${icon}Medium</button></p>
        <p><button type="button" class="buttons" id="button3">${icon}${icon}${icon}Hard</button></p>
        <p><button type="button" class="buttons" id="button4">${icon}${icon}${icon}${icon}Extra Hard</button></p>
    </div>
    `
);

var buttons = document.getElementsByClassName("buttons");

for (var i=0;i<buttons.length;++i) {
    buttons[i].addEventListener("click",(e)=>{
        localStorage.setItem("difficulty",e.currentTarget.id.replace("button",""))
        window.location.href = "game.html";
    });
}