import { FieldValue, Timestamp } from "firebase/firestore";

export type eventSchema = {
    userId: string; // required
    title: string; // required
    description: string; // optional
    location: string; // optional
    date: string; // required, format: YYYY-MM-DD 2024-10-15
    eventTime: {
        allDay: boolean; // required, true | false
        start: string; // required, timestamp
        end: string; // required, timestamp
    };
    reminder: {
        enabled: boolean; // required, default: false
        time: string; // timestamp
        sent: boolean; // required, default: false
    };
    createdAt: Date; // required
}

export type CreateEventType = {
    userId: string; // required
    title: string; // required
    description: string; // optional
    location: string; // optional
    date: string; // required, format: YYYY-MM-DD 2024-10-15
    eventTime: {
        allDay: boolean; // required, true | false
        start: string; // required, timestamp
        end: string; // required, timestamp
    };
    reminder: {
        enabled: boolean; // required, default: false, true | false
        time: string; // timestamp
        sent: boolean; // required, default: false
    };
    createdAt: Date; // required
};
