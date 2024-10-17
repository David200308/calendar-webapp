import { auth } from '~/firebase.server';

export async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await auth.verifySessionCookie(token);
    return decodedToken;
  } catch (error) {
    console.log(error);
    throw new Error('Invalid authentication token');
  }
}

export async function createUserSessionCookie(idToken: string) {
    try {
        await auth.verifyIdToken(idToken);
        
        const fiveDays = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: fiveDays,
        });
        
        return sessionCookie;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to create session cookie');
    }
}
