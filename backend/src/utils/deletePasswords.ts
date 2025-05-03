import { User } from 'src/users/entities/user.entity';

function deletePassword(user: User): User {
  const result = Object.assign({}, user);
  delete result.password;

  return result;
}

export default deletePassword;
