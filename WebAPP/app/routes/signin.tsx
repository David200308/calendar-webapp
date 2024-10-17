import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createUserSessionCookie } from "~/cms.server";

export const action = async ({
    request,
}: ActionFunctionArgs) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const email = request.headers.get('email');
    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionCookie = await createUserSessionCookie(token);
    if (!sessionCookie) {
        return json({ error: 'Failed to create session cookie' }, { status: 500 });
    }

    return json(
        {
            message: "Login successful",
        },
        {
            headers: {
                "Set-Cookie": `token=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax; Secure`,
            },
        }
    );
}
