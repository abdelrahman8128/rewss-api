export interface IUser extends Document {
    username: string;
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    phoneCode?: string;
    isPhoneVerified?: boolean;
    status: "active" | "inactive" | "pending" | "ban" | "deleted" | "blocked";
    role: "user" | "seller" | "admin" | "super"; // Assuming a role field is needed
    createdAt: Date;
    updatedAt: Date;
}