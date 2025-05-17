import { Request, Response } from 'express';
import { z } from 'zod';
import  User  from '../models/user.model.js'; // Adjust the import path as necessary
import Token from '../models/token.model.js'; // Import the Token model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Zod schema for signup input validation
const signupSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

type SignupInput = z.infer<typeof signupSchema>;

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate input with Zod
    const validatedInput: SignupInput = signupSchema.parse(req.body);
    const { username, email, password } = validatedInput;

    // 2. Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // 3. Create a new user
    const newUser = await User.create({
      username,
      email,
      password,
      usertype: 'User', // Add the usertype here
    });

    // 4. Return a success response
    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid input', errors: error.errors });
    } else {
      console.error('Error in signup:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  // Zod schema for login input validation
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  try {
    // 1. Validate input with Zod
    const validatedInput = loginSchema.parse(req.body);
    const { email, password } = validatedInput;

    // 2. Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 3. Compare the provided password with the hashed password
    if (!user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // 4. Generate a JWT token (replace 'your_jwt_secret' with a strong secret from environment variables)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' }); // e.g., '1h' for 1 hour

    // 5. Respond with the JWT token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token is required' });
    return;
  }

  try {
    const deletedCount = await Token.destroy({
      where: { refreshToken: refreshToken },
    });

    if (deletedCount === 0) {
 res.status(404).json({ message: 'Refresh token not found' });
    } else {
 res.status(200).json({ message: 'Logout successful' });
    }
  } catch (error) {
 console.error('Error during logout:', error);
 res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.params.username;

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'usertype', 'createdAt'], // Exclude sensitive info
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Assuming the authenticated user is attached to req.user by middleware
    // We'll need to set up this middleware later using Passport.js JWT strategy
    // For now, let's assume req.user contains the user object or ID
    const userId = (req as any).user.id; // Adjust based on how user is attached

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'usertype', 'createdAt'], // Include email for the authenticated user's own profile
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching authenticated user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};