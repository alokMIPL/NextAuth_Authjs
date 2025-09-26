"use server";

import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { User } from "@/models/User";
import connectDb from "@/lib/db";
import { signIn } from "../../auth";

const login = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      redirect: false,
      callbackUrl: "/",
      email,
      password,
    });
  } catch (error) {
    const someError = error as CredentialsSignin;
    return someError.cause;
  }
  redirect("/");
};

const register = async (formData: FormData) => {
  const firstname = formData.get("firstname") as string;
  const lastname = formData.get("lastname") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstname || !lastname || !email || !password) {
    throw new Error("Please fill all fields");
  }

  await connectDb();

  // existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await hash(password, 12);

  await User.create({ firstname, lastname, email, password: hashedPassword });
  console.log(`User created successfully 🥂`);
  redirect("/login");
};

const fetchAllUser = async () => {
  await connectDb();
  const users = await User.find({});
  return users;
}


export { register, login, fetchAllUser };