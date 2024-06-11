import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/libs/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    await authenticator.authenticate('casdoor', request, {successRedirect: "/"})

    return redirect('/')
}

