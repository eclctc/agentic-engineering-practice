const usersQueries = require('../db/queries/users');
const { sendEmail } = require('../utils/send-email');
const { validateEmail } = require('../utils/validators');
const { HttpError } = require('../utils/http-error');

function listUsers() {
  return usersQueries.listUsers();
}

function getUserById(id) {
  const user = usersQueries.findUserById(id);
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

async function createUser(name, email) {
  if (!validateEmail(email)) throw new HttpError(400, 'Invalid email address');

  let user;
  try {
    user = usersQueries.insertUser(name, email);
  } catch (err) {
    if (err.message.includes('UNIQUE')) throw new HttpError(409, 'email already exists');
    throw err;
  }

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });
  return user;
}

function updateUser(id, { name, email }) {
  const existing = getUserById(id);
  return usersQueries.updateUser(
    id,
    name !== undefined ? name : existing.name,
    email !== undefined ? email : existing.email
  );
}

function deleteUser(id) {
  if (usersQueries.deleteUser(id) === 0) throw new HttpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
