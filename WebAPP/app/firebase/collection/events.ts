import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { firestore } from "~/firebase.client";
import { CreateEventType, eventSchema } from "../schema/events";

export const addEventCollection = async (EventData: CreateEventType) => {
    try {
        await addDoc(
            collection(firestore, 'events'),
            EventData
        );
        return true;
    } catch (error) {
        console.log(error);
        throw new Error('failed to add user');
    }
};

export const getEventsByYearMonth = async (userId: string, year: string, month: string): Promise<eventSchema[]> => {
    const q = query(
        collection(firestore, 'events'), 
        where('userId', '==', userId), 
        where('date', '>=', `${year}-${month}-01`), 
        where('date', '<=', `${year}-${month}-31`),
        orderBy('date', 'asc'),
        orderBy('eventTime', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data()).sort(
        (a, b) => a.eventTime.allDay === b.eventTime.allDay ? 0 : a.eventTime.allDay ? -1 : 1
    );
    if (!data) throw new Error('user not found');
    return data as eventSchema[];
};

export const getEventsByDate = async (userId: string, date: string) => {
    const q = query(
        collection(firestore, 'events'), 
        where('userId', '==', userId), 
        where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data());
    if (!data) throw new Error('user not found');
    return data as eventSchema[];
};

export const getEventById = async (userId: string, eventId: string) => {
    const q = query(
        collection(firestore, 'events'), 
        where('userId', '==', userId), 
        where('id', '==', eventId)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0];
    if (!data) throw new Error('user not found');
    return data.data();
};

export const isEventConflict = async (userId: string, date: string, start: string, end: string) => {
    const events = await getEventsByDate(userId, date);
    console.log(events);

    if (!Array.isArray(events)) {
        throw new Error('events is not an array');
    }

    const isConflict = events.some((event: eventSchema) => {
        if (event.eventTime.allDay) return true;
        if (start === "" && end === "") return true;
        return (start < event.eventTime.end && end > event.eventTime.start);
    });
    
    return isConflict;
};
