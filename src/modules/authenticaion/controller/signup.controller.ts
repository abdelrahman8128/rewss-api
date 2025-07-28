import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


import  users  from '../../../Schema/User/user.schema'; 

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in the database
        const newUser = await users.create({ email, name, password: hashedPassword });

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1h',
        });

        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser._id, email: newUser.email, name: newUser.name },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};