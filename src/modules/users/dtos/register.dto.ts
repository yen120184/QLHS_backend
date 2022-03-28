import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
export default class RegisterDto {
  constructor(
    user_name: string,
    username: string,
    position: string,
    password: string,
    permission: string,
    department: string
  ) {
    this.user_name = user_name;
    this.username = username;
    this.position = position;
    this.password = password;
    this.permission = permission;
    this.department = department;
  }
  @IsNotEmpty()
  public user_name: string;

  @IsNotEmpty()
  public username: string;

  @IsNotEmpty()
  public position: string;

  @IsNotEmpty()
  @MinLength(6)
  public password: string;

  @IsNotEmpty()
  public permission: string;

  @IsNotEmpty()
  public department: string;
}
