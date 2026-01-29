/**
 * Function Template with URL Imports
 *
 * Import npm packages directly from CDN URLs!
 *
 * Supported CDNs:
 * - esm.sh (recommended): https://esm.sh/lodash@4.17.21
 * - Skypack: https://cdn.skypack.dev/lodash@4.17.21
 * - jsDelivr: https://esm.run/lodash@4.17.21
 *
 * Tips:
 * - Always pin versions (e.g., @4.17.21) for reproducible builds
 * - esm.sh auto-bundles dependencies
 * - Use ?bundle flag for packages with many deps: https://esm.sh/package?bundle
 *
 * Network: External APIs allowed, localhost blocked (security)
 */

import _ from 'https://esm.sh/lodash@4.17.21';
import dayjs from 'https://esm.sh/dayjs@1.11.10';

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

export async function handler(input: any, context: Context) {
    // Use lodash to sort items
    const items = input.items || [];
    const sorted = _.sortBy(items, 'name');
    const unique = _.uniq(input.values || []);

    // Use dayjs for timestamp
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');

    return {
        message: `Hello from ${context.functionName}!`,
        sorted,
        unique,
        processedAt: timestamp,
        count: sorted.length
    };
}
