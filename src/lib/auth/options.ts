import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { connectMongo } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile) {
        return false;
      }

      await connectMongo();

      const profileData = profile as Record<string, unknown>;
      const providerId =
        typeof profileData.sub === "string" ? profileData.sub : undefined;
      const profileEmail =
        typeof profileData.email === "string" ? profileData.email : undefined;
      const profileName =
        typeof profileData.name === "string" ? profileData.name : undefined;
      const profilePicture =
        typeof profileData.picture === "string"
          ? profileData.picture
          : undefined;

      const email = (profileEmail ?? user.email)?.toLowerCase();
      if (!email || !providerId) {
        return false;
      }

      const persistedUser = await UserModel.findOneAndUpdate(
        { providerId },
        {
          $set: {
            providerId,
            email,
            name: profileName ?? user.name ?? email,
            image: profilePicture ?? user.image,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).exec();

      user.id = persistedUser._id.toString();
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
  events: {
    async signIn() {
      // seeding categories lazily after first successful sign-in ensures DB readiness
      const { ensureDefaultCategories } = await import(
        "@/lib/services/categoryService"
      );
      await ensureDefaultCategories();
    },
  },
};
