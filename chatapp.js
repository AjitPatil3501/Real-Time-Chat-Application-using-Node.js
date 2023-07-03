const username = id;
const participants = JSON.stringify(participants) ;
const tabsContainer = document.getElementById("tabs-container");

// Create a new row of tabs for each group of 3 participants
for (let i = 0; i < participants.length; i += 3) {
  const row = document.createElement("div");
  row.className = "tab-row";

  // Create a new tab for each participant in the current group
  for (let j = i; j < i + 3 && j < participants.length; j++) {
    const participant = participants[j];
    const tab = document.createElement("li");
    const tabLink = document.createElement("a");
    tabLink.innerHTML = participant.name + '_' + participant.id;
    tabLink.setAttribute("href", "/chat/" + participant.id);
    tab.appendChild(tabLink);
    row.appendChild(tab);
  }
  tabsContainer.appendChild(row);
}
