const socket = io();

let send = document.querySelector(".send");
let textArea = document.querySelector(".textarea");
let messages = document.querySelector(".messages");
let messageBox = document.querySelector(".messagebox");
let setbtn = document.querySelector(".setbtn");
let nameinput = document.querySelector(".nameinput");
let overlay = document.querySelector(".overlay");
let roomSelect = document.querySelector(".room-select");

let currentRoom = "all";

send.addEventListener("click", function () {
  socket.emit("message", { message: textArea.value, room: currentRoom });
  textArea.value = "";
});

textArea.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send.click();
  }
});

let container = ``;

socket.on("message", function (message) {
  let myMessage = message.id === socket.id;

  container = `<div class="flex ${myMessage ? "justify-end" : "justify-start"}">
<div class="${myMessage ? "bg-blue-600" : "bg-zinc-800"} text-white p-3 ${
    myMessage ? "rounded-l-lg rounded-br-lg" : "rounded-r-lg rounded-tl-lg"
  } ">
<p class="text-sm">${message.name} : ${message.message}</p>
</div>
</div>`;

  messages.innerHTML += container;
  messageBox.scrollTop = messageBox.scrollHeight;
});

nameinput.addEventListener("input", function () {
  let newvalue;
  if (nameinput.value.trim().length > 0) {
    newvalue = nameinput.value.replace(" ", "_");
  } else {
    newvalue = "";
  }
  nameinput.value = newvalue;
});

setbtn.addEventListener("click", function () {
  if (nameinput.value.trim().length > 0) {
    socket.emit("nameset", nameinput.value.trim());
  }
});

socket.on("namesetdone", function () {
  document.querySelector(".username").textContent = nameinput.value.trim();
  overlay.style.display = "none";
});

socket.on("numbersofusers", function (number) {
  document.querySelector(".onlineusers").textContent = number;
});

roomSelect.addEventListener("change", function () {
  currentRoom = roomSelect.value;
  socket.emit("joinroom", currentRoom);
});

textArea.addEventListener("input", function () {
  socket.emit("typing", currentRoom);
});

let timer;
socket.on("typing", function (name) {
  document.querySelector(".typing").textContent = `${name.name} is typing...`;
  clearTimeout(timer);
  timer = setTimeout(function () {
    document.querySelector(".typing").textContent = "";
  }, 1200);
});


socket.on("userleft", function (name) {
  let myMessage = name.id === socket.id;

  container = `<div class="flex ${myMessage ? "justify-end" : "justify-start"}">
<div class="${myMessage ? "bg-blue-600" : "bg-zinc-800"} text-white p-3 ${
    myMessage ? "rounded-l-lg rounded-br-lg" : "rounded-r-lg rounded-tl-lg"
  } ">
<p class="text-sm">${name} has left chat</p>
</div>
</div>`;

messages.innerHTML += container;
messageBox.scrollTop = messageBox.scrollHeight;
});
