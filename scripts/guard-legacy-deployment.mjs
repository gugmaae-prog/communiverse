console.error('STOP: This legacy Next.js entrypoint is not the complete live Communiverse Worker. A blind Wrangler deployment would overwrite retained APIs and bindings. See PRODUCTION.md. Use the approved Cloudflare version-upload procedure; no runtime has been changed by this guard.');
process.exit(1);
