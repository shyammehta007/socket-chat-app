const socket = io();

//Elements

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const linkTemplate = document.querySelector("#link-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visibleHeight
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const containerHeight = $messages.scrollHeight;

  //how far have i scroll
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (response) => {
  const { text: message, createdAt, username } = response;
  const html = Mustache.render(messageTemplate, {
    message,
    createdAt: moment(createdAt).format("h:mm a"),
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (response) => {
  const { url, createdAt, username } = response;
  const html = Mustache.render(linkTemplate, {
    url,
    createdAt: moment(createdAt).format("h:mm a"),
    username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  //disable

  const message = e.target.elements.message.value;

  //enable
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const {
      coords: { longitude, latitude },
    } = position;
    socket.emit(
      "sendLocation",
      `https://google.com/maps?q=${latitude},${longitude}`,
      (ack) => {
        $sendLocationButton.removeAttribute("disabled");
      }
    );
  });
});

// sending room and username
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});
