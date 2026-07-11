let log =
JSON.parse(localStorage.getItem("evonyLog"))
|| [];


let goal =
Number(localStorage.getItem("goal"))
|| 0;


let selectedMonster = null;

let suggestions = [];

let activeSuggestion = -1;



const searchBox =
document.getElementById("monsterSearch");


const autocompleteList =
document.getElementById("autocompleteList");



const leadGeneral =
document.getElementById("leadGeneral");


const assistantGeneral =
document.getElementById("assistantGeneral");


const staminaReduction =
document.getElementById("staminaReduction");


const displayLead =
document.getElementById("displayLead");


const displayAssistant =
document.getElementById("displayAssistant");


const baseStamina =
document.getElementById("baseStamina");


const finalStamina =
document.getElementById("finalStamina");





document.getElementById("prestigeGoal").value =
goal;






/*
====================================
GENERAL SYSTEM
====================================
*/


function getGeneral(id){

return generals.find(
g=>g.id===id
);

}





function populateGeneralMenus(){


let currentLead =
leadGeneral.value;


let currentAssist =
assistantGeneral.value;



leadGeneral.innerHTML =
`
<option value="none">
None
</option>
`;



assistantGeneral.innerHTML =
`
<option value="none">
None
</option>
`;





generals.forEach(g=>{


if(
g.roles.includes("lead")
&&
g.id!==currentAssist
){


let option =
document.createElement("option");


option.value =
g.id;


option.textContent =
g.name;


leadGeneral.appendChild(option);


}





if(
g.roles.includes("assistant")
&&
g.id!==currentLead
){


let option =
document.createElement("option");


option.value =
g.id;


option.textContent =
g.name;


assistantGeneral.appendChild(option);


}


});






if(
[...leadGeneral.options]
.some(o=>o.value===currentLead)
)

leadGeneral.value=currentLead;





if(
[...assistantGeneral.options]
.some(o=>o.value===currentAssist)
)

assistantGeneral.value=currentAssist;


}








function calculateReduction(){


let lead =
getGeneral(
leadGeneral.value
);


let assist =
getGeneral(
assistantGeneral.value
);




if(!lead && !assist)

return 0;




if(
lead &&
assist &&
lead.id===assist.id
)

return -1;





if(

(
lead?.id==="greene"
&&
assist?.id==="maria"
)

||

(
lead?.id==="maria"
&&
assist?.id==="greene"
)

)

return -1;




let total=0;



if(lead)

total += lead.reduction;



if(assist)

total += assist.reduction;



return total;


}








function updateReduction(){


let reduction =
calculateReduction();



let lead =
getGeneral(
leadGeneral.value
);



let assist =
getGeneral(
assistantGeneral.value
);



displayLead.textContent =
lead ? lead.name : "None";


displayAssistant.textContent =
assist ? assist.name : "None";



staminaReduction.textContent =
reduction < 0
?
"Invalid"
:
reduction+"%";




if(selectedMonster){


let cost =
selectedMonster.stamina;



baseStamina.textContent =
cost;




if(reduction>0){


cost =
Math.ceil(
selectedMonster.stamina *
(1-(reduction/100))
);


}



finalStamina.textContent =
cost;



}

else{


baseStamina.textContent="0";

finalStamina.textContent="0";


}


}/*
====================================
TOP MONSTER SEARCH
====================================
*/


function getSuggestions(){


let text =
searchBox.value.toLowerCase();



if(!text)

return [];




return monsters.filter(m=>

m.name
.toLowerCase()
.includes(text)

)
.slice(0,15);


}







function renderSuggestions(){


autocompleteList.innerHTML="";


suggestions =
getSuggestions();


activeSuggestion=-1;




suggestions.forEach(
(monster,index)=>{


let item =
document.createElement("div");


item.className =
"autocomplete-item";


item.textContent =
monster.name;



item.onclick =
()=>chooseMonster(index);



item.ontouchend =
()=>chooseMonster(index);



autocompleteList.appendChild(item);



});


}







function chooseMonster(index){


if(!suggestions[index])

return;



selectedMonster =
suggestions[index];


searchBox.value =
selectedMonster.name;


autocompleteList.innerHTML="";


updateReduction();


}








searchBox.addEventListener(
"input",
()=>{


selectedMonster=null;


renderSuggestions();


});







searchBox.addEventListener(
"keydown",
e=>{


if(!suggestions.length)

return;




if(e.key==="ArrowDown"){


e.preventDefault();


activeSuggestion++;



if(activeSuggestion>=suggestions.length)

activeSuggestion=0;


}





else if(e.key==="ArrowUp"){


e.preventDefault();


activeSuggestion--;



if(activeSuggestion<0)

activeSuggestion=suggestions.length-1;


}





else if(
(
e.key==="Enter"
||
e.key==="Tab"
)
&&
activeSuggestion>=0
){


e.preventDefault();


chooseMonster(activeSuggestion);


}


});









/*
====================================
LEDGER MANAGEMENT
====================================
*/


function addKills(amount){


if(!selectedMonster){


alert(
"Select a monster first"
);


return;


}




let entry =
log.find(
x=>x.name===selectedMonster.name
);



if(!entry){


entry={

name:selectedMonster.name,

kills:0

};


log.push(entry);


}




entry.kills += amount;



save();


update();


}









function addEmptyRow(){


log.push({

name:"",

kills:0

});


save();


update();


}








function deleteRow(index){


log.splice(index,1);


save();


update();


}








function clearLog(){


if(confirm(
"Delete all tracked monsters?"
)){


log=[];


save();


update();


}


}








function save(){


localStorage.setItem(
"evonyLog",
JSON.stringify(log)
);


}








function updateMonsterName(index,value){


let monster =
monsters.find(
m=>m.name===value
);



if(monster){


log[index].name =
monster.name;


}


else{


log[index].name =
"";


}



save();


update();


}








function updateKillAmount(index,value){


let amount =
Number(value);



if(
isNaN(amount)
||
amount<0
)

amount=0;



log[index].kills =
Math.floor(amount);



save();


update();


}








function createTableAutocomplete(input,index){


let list =
document.createElement("div");


list.className =
"autocomplete-list-table";


input.parentNode.appendChild(list);





input.addEventListener(
"input",
()=>{


list.innerHTML="";



let text =
input.value.toLowerCase();




let matches =
monsters.filter(m=>

m.name
.toLowerCase()
.includes(text)

)
.slice(0,10);





matches.forEach(m=>{


let item =
document.createElement("div");


item.className =
"autocomplete-item";


item.textContent =
m.name;



item.onclick =
()=>{


input.value=m.name;


list.innerHTML="";


updateMonsterName(
index,
m.name
);


};



item.ontouchend =
item.onclick;



list.appendChild(item);



});



});


}/*
====================================
BUILD TABLE
====================================
*/


function buildTable(){


let table =
document.getElementById("logTable");



table.innerHTML="";





log.forEach(
(entry,index)=>{


let row =
document.createElement("tr");



let monster =
monsters.find(
m=>m.name===entry.name
);





if(
!monster
&&
entry.name!==""
)

row.classList.add(
"invalid-row"
);







let monsterCell =
document.createElement("td");



let monsterInput =
document.createElement("input");



monsterInput.className =
"kill-monster-input";


monsterInput.value =
entry.name;



monsterInput.placeholder =
"Search monster";



monsterCell.appendChild(
monsterInput
);



createTableAutocomplete(
monsterInput,
index
);






let killCell =
document.createElement("td");


let killInput =
document.createElement("input");



killInput.type="number";

killInput.min=0;

killInput.className =
"kill-number";


killInput.value =
entry.kills;



killInput.onchange =
()=>{

updateKillAmount(
index,
killInput.value
);

};



killCell.appendChild(
killInput
);






let prestigeCell =
document.createElement("td");


let staminaCell =
document.createElement("td");



let prestige=0;

let stamina=0;




if(monster){


prestige =
monster.prestige *
entry.kills;



let cost =
monster.stamina;



let reduction =
calculateReduction();



if(reduction>0){


cost =
Math.ceil(
monster.stamina *
(1-(reduction/100))
);


}



stamina =
cost *
entry.kills;



}




prestigeCell.textContent =
prestige;



staminaCell.textContent =
stamina;






let deleteCell =
document.createElement("td");


let deleteButton =
document.createElement("button");



deleteButton.textContent =
"🗑";



deleteButton.className =
"delete-button";



deleteButton.onclick =
()=>deleteRow(index);



deleteCell.appendChild(
deleteButton
);





row.appendChild(monsterCell);

row.appendChild(killCell);

row.appendChild(prestigeCell);

row.appendChild(staminaCell);

row.appendChild(deleteCell);



table.appendChild(row);



});



}









/*
====================================
TOTALS + STATISTICS
====================================
*/


function update(){


let prestige=0;

let stamina=0;

let kills=0;

let unique=new Set();



let reduction =
calculateReduction();





log.forEach(entry=>{


let monster =
monsters.find(
m=>m.name===entry.name
);



if(!monster)

return;



unique.add(
monster.name
);



kills +=
entry.kills;



prestige +=
monster.prestige *
entry.kills;




let cost =
monster.stamina;



if(reduction>0){


cost =
Math.ceil(
monster.stamina *
(1-(reduction/100))
);


}



stamina +=
cost *
entry.kills;



});






document.getElementById(
"currentPrestige"
)
.textContent =
prestige;



document.getElementById(
"monsterPrestige"
)
.textContent =
prestige;



document.getElementById(
"staminaUsed"
)
.textContent =
stamina;



document.getElementById(
"uniqueMonsters"
)
.textContent =
unique.size;



document.getElementById(
"totalKills"
)
.textContent =
kills;



document.getElementById(
"totalPrestige"
)
.textContent =
prestige;



document.getElementById(
"averagePrestige"
)
.textContent =
kills===0
?
0
:
Math.floor(
prestige/kills
);





let percent =

goal===0

?

0

:

Math.min(
(prestige/goal)*100,
100
);





document.getElementById(
"progressBar"
)
.style.width =
percent+"%";



document.getElementById(
"progressBar"
)
.textContent =
percent.toFixed(1)+"%";





buildTable();



}









/*
====================================
EXPORT
====================================
*/


function exportCSV(){


let csv =
"Monster,Kills,Prestige,Stamina\n";



log.forEach(entry=>{


let monster =
monsters.find(
m=>m.name===entry.name
);



if(!monster)

return;



let prestige =
monster.prestige *
entry.kills;



let stamina =
monster.stamina *
entry.kills;



csv +=
`${monster.name},${entry.kills},${prestige},${stamina}\n`;



});




let blob =
new Blob(
[csv],
{
type:"text/csv"
}
);



let link =
document.createElement("a");


link.href =
URL.createObjectURL(blob);



link.download =
"Evony_Kill_Tracker.csv";



link.click();



}








function exportJSON(){


let blob =
new Blob(
[
JSON.stringify(
log,
null,
2
)
],
{
type:"application/json"
}
);



let link =
document.createElement("a");


link.href =
URL.createObjectURL(blob);



link.download =
"Evony_Backup.json";


link.click();



}









function copyTable(){


let text =
"Monster\tKills\tPrestige\tStamina\n";



log.forEach(entry=>{


let monster =
monsters.find(
m=>m.name===entry.name
);



if(!monster)

return;



text +=
`${monster.name}\t${entry.kills}\t${monster.prestige*entry.kills}\t${monster.stamina*entry.kills}\n`;



});



navigator.clipboard.writeText(text);


alert(
"Table copied"
);


}









/*
====================================
EVENTS
====================================
*/


leadGeneral.addEventListener(
"change",
()=>{

populateGeneralMenus();

updateReduction();

update();

});



assistantGeneral.addEventListener(
"change",
()=>{

populateGeneralMenus();

updateReduction();

update();

});






document
.getElementById("prestigeGoal")
.addEventListener(
"change",
e=>{


goal =
Number(e.target.value);



localStorage.setItem(
"goal",
goal
);



update();



});









/*
====================================
START
====================================
*/


populateGeneralMenus();

updateReduction();

update();