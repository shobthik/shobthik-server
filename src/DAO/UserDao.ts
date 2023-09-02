import User from "../entities/user/User";
import { DatabaseService } from "./DatabaseService";

export class UserDao extends DatabaseService {
  async getUserById(id: string) {
    if (!id) {
      return null;
    }

    const connection = await UserDao.getConnection();
    const userRepository = connection.getRepository(User);

    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch {
      console.error(`User fetch failed for ID: ${id}`);
    }

    return user;
  }

  async updateNewUserState(id: string) {
    if (!id) {
      console.error("A valid id is required to perform this operation");
      return false;
    }

    const user = this.getUserById(id);

    if (!user) {
      console.error(`User does not exist for ID: ${id}`);
      return false;
    }

    const connection = await UserDao.getConnection();
    const userRepository = connection.getRepository(User);

    const updateResults = await userRepository.update(id, { isNewUser: false });
    return updateResults.affected === 1;
  }
}
