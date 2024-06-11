import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { authenticator } from "~/libs/auth.server";
import { commitSession, getSession } from "~/libs/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const result = await authenticator.authenticate('casdoor', request, { throwOnError: true }).then(data => ({ success: true, data }) as const, error => ({ success: false, error }) as const)
    if (result.success) {
        const session = await getSession(request.headers.get('cookie'));
        session.set(authenticator.sessionKey, result.data)

        let headers = new Headers({'Set-Cookie': await commitSession(session)});
        return redirect('/', {headers})
    }
    return redirect('/')

}
