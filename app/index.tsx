import { firstLaunchStore } from "@/storage/firstLaunch";
import { tokenStore } from "@/storage/token";
import { Href, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
    const [ready, setReady] = useState(false);
    const [href, setHref] = useState<Href>("/welcome");

    useEffect(() => {
        (async () => {
            const hasSeen = await firstLaunchStore.hasSeenWelcome();
            if (!hasSeen) {
                setHref("/welcome");
                setReady(true);
                return;
            }

            const [access, refresh] = await Promise.all([
                tokenStore.getAccessToken(),
                tokenStore.getRefreshToken(),
            ]);

            const isLoggedIn = !!access || !!refresh;
            setHref(isLoggedIn ? "/tabs/quiz" : "/auth/login");
            setReady(true);
        })();
    }, []);

    if (!ready) return null;

    return <Redirect href={href} />;
}
