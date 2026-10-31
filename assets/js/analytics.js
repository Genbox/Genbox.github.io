(() => {
    const host = location.hostname;
    if (host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || /^127\./.test(host)) {
        return;
    }
    // Async loading keeps analytics from holding back DOMContentLoaded.
    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfBeacon = JSON.stringify({ token: "__CLOUDFLARE_TOKEN__" });
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    document.head.appendChild(script);
})();