import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback as GoogleVerifyCallback,
} from "passport-google-oauth20";
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from "passport-github2";

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findByPk(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.OAUTH_GOOGLE_CALLBACK_URL!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: GoogleVerifyCallback
    ) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        if (!email)
          return done(null, false, { message: "No email from Google profile" });
        let user = await User.findOne({ where: { email } });
        if (!user) {
          user = await User.create({
            username: profile.displayName || email.split("@")[0],
            email,
            usertype: "User",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.OAUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.OAUTH_GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: (error: any, user?: any, info?: any) => void
    ) => {
      try {
        let email = profile.emails && profile.emails[0]?.value;
        if (!email && (profile as any)._json && (profile as any)._json.email) {
          email = (profile as any)._json.email;
        }
        if (!email)
          return done(null, false, { message: "No email from GitHub profile" });
        let user = await User.findOne({ where: { email } });
        if (!user) {
          user = await User.create({
            username: profile.username || email.split("@")[0],
            email,
            githubId: profile.id,
            usertype: "User",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

export default passport;
