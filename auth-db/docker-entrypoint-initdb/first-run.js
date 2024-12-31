db.createCollection("users");
db.users.insert({
  username: "admin",
  password: "password",
  role: "admin"
});