import { FieldValue, Timestamp } from "firebase/firestore";

export type userSchema = {
    uid: string;
    email: string;
    createdAt: Timestamp | FieldValue;
    createVia: "email" | "google";
}

export type SignUpUserType = {
    uid: string;
    email: string;
    createdAt: Timestamp | FieldValue;
    createVia: "email" | "google";
};

