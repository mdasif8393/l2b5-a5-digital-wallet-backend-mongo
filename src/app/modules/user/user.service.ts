import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { AgentStatus, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { Wallet } from "../wallet/wallet.model";
import { WalletStatus } from "../wallet/wallet.interface";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  let agentStatus;
  if (payload?.role === Role.AGENT) {
    agentStatus = AgentStatus.PENDING;
  }

  const session = await User.startSession();
  session.startTransaction();
  try {
    const user = await User.create(
      [
        {
          email,
          agentStatus,
          password: hashedPassword,
          ...rest,
        },
      ],
      { session }
    );

    await Wallet.create(
      [
        {
          userId: user[0]._id,
          status: WalletStatus.UNBLOCK,
          balance: 50,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await session.endSession();

    return user;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};
const updateAgentStatus = async (id: string, payload: Partial<IUser>) => {
  const agentStatus = payload.agentStatus;

  const isUserExists = await User.findById(id);

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent is not found");
  }

  if (isUserExists.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent is not found ");
  }

  if (
    isUserExists.agentStatus === AgentStatus.APPROVED &&
    agentStatus === AgentStatus.APPROVED
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Agent is already in Approved status"
    );
  }
  if (
    isUserExists.agentStatus === AgentStatus.SUSPENDED &&
    agentStatus === AgentStatus.SUSPENDED
  ) {
    throw new AppError(httpStatus.CONFLICT, "Agent is already Suspended");
  }

  if (isUserExists?.role === Role.USER || isUserExists?.role === Role.ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This user is not agent. So, you can not change this user agentStatus"
    );
  }

  const updateUser = await User.findByIdAndUpdate(
    id,
    {
      agentStatus,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  return {
    data: {
      agentStatus: updateUser?.agentStatus,
    },
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  return {
    data: user,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized");
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // if (
  //   decodedToken.role === Role.ADMIN &&
  //   ifUserExist.role === Role.SUPER_ADMIN
  // ) {
  //   throw new AppError(401, "You are not authorized");
  // }

  /**
   * email - can not update
   * name, phone, password address
   * password - re hashing
   *  only admin superadmin - role, isDeleted...
   *
   * promoting to superadmin - superadmin
   */

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateAgentStatus,
  getMe,
  updateUser,
};
