import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { SignUpUserType } from "../schema/user";
import { firestore } from "~/firebase.client";

export const addUserCollection = async (UserData: SignUpUserType) => {
    try {
        if (UserData.createVia === 'google' && await checkEmailExists(UserData.email)) {
            return true;
        }
        await setDoc(doc(firestore, 'users', UserData.uid), UserData);
        return true;
    } catch (error) {
        console.log(error);
        throw new Error('failed to add user');
    }
};

export const userDataQuery = async (uid: string) => {
    const q = query(collection(firestore, 'users', uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0];
    if (!data) throw new Error('user not found');
    return data.data();
};

export const checkEmailExists = async (email: string) => {
    const q = query(collection(firestore, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0;
};
