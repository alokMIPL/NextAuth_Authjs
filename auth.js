import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import connectDb from "./src/lib/db";
import { User } from "./src/models/User";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please provide both email and password");
        }

        await connectDb();

        const user = await User.findOne({ email }).select("+password +role");

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatched = await compare(password, user.password);
        if (!isMatched) {
          throw new Error("Password did not match");
        }

        return {
          id: user._id.toString(),
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          image: user.image || null,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user";
        token.firstname = user.firstname || "";
        token.lastname = user.lastname || "";
        token.image = user.image || "";
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }

      session.user.role = token?.role || "user";
      session.user.firstname = token?.firstname || "";
      session.user.lastname = token?.lastname || "";
      session.user.image = token?.image || "";

      return session;
    },

    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const { email, name, image, id } = user;

          await connectDb();
          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            // Split Google "name" into firstname + lastname
            const [firstname, ...rest] = (name || "").split(" ");
            const lastname = rest.join(" ");

            await User.create({
              firstname: firstname || "",
              lastname: lastname || "",
              email,
              image,
              authProviderId: id,
              provider: "google",
              role: "user", // default role
            });
          }

          return true;
        }

        if (account?.provider === "credentials") {
          return true; // already validated in authorize()
        }

        return true; // allow all other providers by default
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },
  },
});
