import { HttpException } from "@core/exceptions";
import { isEmptyObject } from "@core/utils";
import { DataStoredInToken, TokenData } from "@modules/auth";
import RegisterDto from "./dtos/register.dto";
import UserSchema from "./users.model";
import gravatar from "gravatar";
import bcryptjs from "bcryptjs";
import IUser from "./users.interface";
import jwt from "jsonwebtoken";
import { IPagination } from "@core/interfaces";
class UserService {
  public userSchema = UserSchema;

  public async createUser(model: RegisterDto): Promise<TokenData> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty.");
    }

    const user = await this.userSchema
      .findOne({ username: model.username })
      .exec();
    if (user) {
      throw new HttpException(
        409,
        `Your username ${model.username} already exits.`
      );
    }

    // const avatar = gravatar.url(model.email!, {
    //   size: "200",
    //   rating: "g",
    //   default: "mm",
    // });

    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash(model.password!, salt);
    const createUser: IUser = await this.userSchema.create({
      ...model,
      password: hashedPassword,
      // avatar: avatar,
      date: Date.now(),
    });
    return this.createToken(createUser);
  }

  public async updateUser(userId: string, model: RegisterDto): Promise<IUser> {
    if (isEmptyObject(model)) {
      throw new HttpException(400, "Model is empty.");
    }

    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(400, `User Id is not exits.`);
    }
    //let avatar = user.avatar;
    if (user.username === model.username) {
      throw new HttpException(400, "You must using the difference username");
    }

    let updateUserById;
    if (model.password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(model.password, salt);
      updateUserById = await this.userSchema
        .findByIdAndUpdate(userId, {
          ...model,
          password: hashedPassword,
        })
        .exec();
    } else {
      updateUserById = await this.userSchema
        .findByIdAndUpdate(userId, {
          ...model,
        })
        .exec();
    }

    if (!updateUserById) throw new HttpException(409, "Your are not an user");

    return updateUserById;
  }

  public async getUserById(userId: string): Promise<IUser> {
    const user = await this.userSchema.findById(userId).exec();
    if (!user) {
      throw new HttpException(409, `User is not exists`);
    }
    return user;
  }

  public async getAll(): Promise<IUser[]> {
    const users = await this.userSchema.find().exec();
    return users;
  }

  public async getAllPaging(
    keyword: string,
    page: number
  ): Promise<IPagination<IUser>> {
    const pageSize: number = Number(process.env.PAGE_SIZE || 10);

    let query = {};
    if (keyword) {
      query = {
        $or: [{ user_name: keyword }, { username: keyword }],
      };
    }

    const users = await this.userSchema
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const rowCount = await this.userSchema.find(query).countDocuments().exec();

    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: users,
    } as IPagination<IUser>;
  }

  public async deleteUser(userId: string): Promise<IUser> {
    const deletedUser = await this.userSchema.findByIdAndDelete(userId).exec();
    if (!deletedUser) throw new HttpException(409, "Your id is invalid");
    return deletedUser;
  }

  private createToken(user: IUser): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user._id };
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 60;
    return {
      token: jwt.sign(dataStoredInToken, secret, { expiresIn: expiresIn }),
    };
  }
}
export default UserService;
