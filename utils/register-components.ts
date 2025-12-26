/**
 * Runtime component registration
 *
 * Components are now loaded lazily on-demand via lazy-component-loader.ts
 * This file is kept for backwards compatibility and to load essential components.
 *
 * Components that depend on @nuralyui packages are NOT imported here.
 * They are loaded dynamically when first used via the lazy loader.
 */

// Only import components that DON'T have @nuralyui dependencies
// or are essential for the runtime to work

// Toast is needed globally
import "../components/ui/components/ToastContainer/ToastContainer";
