import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Username" },
        password: { label: "Password", type: "password", placeholder: "Username" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)

        // Check if any credentials were provided
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        //-- Verify that the user exists in the database --//
        // Retrieve the user from the database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Check if a user with the email provided exists
        if (!user) {
          // It does not
          return null;
        }

        // Check if the password provided matches that of the user retrieved
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        // Any object returned will be saved in the `user` property of the JWT
        return isPasswordCorrect ? user : null;
      },
    }),
  ],
};

export default NextAuth(authOptions);
