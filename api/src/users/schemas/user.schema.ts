import { Schema, Document } from 'mongoose';

export interface IUser {
    _id?: string;
    name: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type IUserDocument = IUser & Document;

export const UserSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        // Collation to make this field case-insensitive for uniqueness and queries
        index: { collation: { locale: 'en', strength: 2 } } 
    },
    password: { type: String, required: true }
}, { 
    timestamps: true,
    collation: { locale: 'en', strength: 2 }
});
