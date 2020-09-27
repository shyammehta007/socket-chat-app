const users = [];

//add user

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room || username === "admin")
    return {
      error: "username and room are required or username can not be admin",
    };
  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) return { error: "username is in use" };
  const user = { id, username, room };
  users.push(user);
  return {
    user,
  };
};
//remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
//get user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};
//get user in room
const getUserInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
