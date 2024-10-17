import { json } from '@remix-run/node';
import { verifyAuthToken } from '~/cms.server';
import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({
  request,
}: ActionFunctionArgs) => {  
  const token = request.headers.get("Cookie")?.split("=")[1];
  if (!token) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await verifyAuthToken(token!);
    const { uid } = decodedToken;

    return json(
      {
        success: true,
        uid: uid,
      }
    )
  } catch (error: unknown) {
    if (error instanceof Error)
    return json({ error: error.message }, { status: 401 });
  }
};
