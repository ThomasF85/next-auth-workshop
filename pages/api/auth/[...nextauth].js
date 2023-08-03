import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [];
// Check if we are running on preview
if (process.env.VERCEL_ENV === "preview") {
  providers.push(
    // Create a credentials provider with dummy data, describing input fields:
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "fish" },
        password: { label: "Password", type: "password" },
      },
      // and adding a fake authorization with static username and password:
      async authorize(credentials) {
        if (
          credentials.username === "fish" &&
          credentials.password === "fishbone"
        ) {
          return {
            id: "1",
            name: "Flipper",
            email: "YOUR-EMAIL-USED@github",
          };
        } else {
          return null;
        }
      },
    })
  );
} else {
  // If not on preview, we use the GithubProvider as before
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

async function getUserRoleFromDatabaseByEmail(email) {
  if (email === "thomas.foeldi@gmail.com") {
    return "owner";
  }
  return "viewer";
}

async function getUserRoleFromDatabaseById(id) {
  if (id === "1") {
    return "owner";
  }
  return "viewer";
}

export const authOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Will only get user object on initial JWT creation => will only run into this if statement once when signing in
        token.userId = user.id;
        token.role = await getUserRoleFromDatabaseById(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    },
  },
};

export default NextAuth(authOptions);
