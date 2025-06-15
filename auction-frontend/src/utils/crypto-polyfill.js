// crypto-polyfill.js
(function() {
    'use strict';

    // ESLint globals declaration
    /* global window, globalThis, global, module, define */

    console.log('🔐 Loading crypto polyfill...');

    // Ensure global object exists
    if (typeof window !== 'undefined') {
        if (typeof window.global === 'undefined') {
            window.global = window;
        }
        if (typeof globalThis === 'undefined') {
            window.globalThis = window;
        }
    }

    // Implement randomBytes function - this is what SockJS needs
    const randomBytes = function(size) {
        if (typeof size !== 'number' || size < 0) {
            throw new Error('Invalid size for randomBytes');
        }

        const bytes = new Uint8Array(size);

        // Use browser's crypto API if available
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(bytes);
        } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
            globalThis.crypto.getRandomValues(bytes);
        } else {
            // Fallback to Math.random (less secure but functional)
            console.warn('Using Math.random fallback for crypto.randomBytes - not cryptographically secure');
            for (let i = 0; i < size; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }

        return bytes;
    };

    // Implement createHash function
    const createHash = function(algorithm) {
        console.warn('createHash is a stub implementation for compatibility');

        return {
            update: function(data) {
                console.warn('Hash update is a stub implementation');
                return this;
            },
            digest: function(encoding) {
                console.warn('Hash digest is a stub implementation');
                return encoding === 'hex' ? 'deadbeef' : new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
            }
        };
    };

    // Create crypto object
    const cryptoPolyfill = {
        randomBytes: randomBytes,
        createHash: createHash,
        getRandomValues: function(array) {
            if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
                return window.crypto.getRandomValues(array);
            } else {
                for (let i = 0; i < array.length; i++) {
                    array[i] = Math.floor(Math.random() * 256);
                }
                return array;
            }
        }
    };

    // CRITICAL: Force setup crypto before any other modules load
    if (typeof window !== 'undefined') {
        // Strategy 1: Try to extend existing crypto
        if (window.crypto && typeof window.crypto === 'object') {
            try {
                // Try to add methods to existing crypto
                if (!window.crypto.randomBytes) {
                    window.crypto.randomBytes = randomBytes;
                    console.log('✅ Added randomBytes to existing window.crypto');
                }
                if (!window.crypto.createHash) {
                    window.crypto.createHash = createHash;
                    console.log('✅ Added createHash to existing window.crypto');
                }
            } catch (e) {
                console.warn('⚠️ Could not extend window.crypto:', e.message);
                // Strategy 2: Create backup reference
                window.cryptoPolyfill = cryptoPolyfill;
                console.log('✅ Created window.cryptoPolyfill as backup');
            }
        } else {
            // Strategy 3: Create new crypto object
            try {
                window.crypto = cryptoPolyfill;
                console.log('✅ Created new window.crypto object');
            } catch (e) {
                console.warn('⚠️ Could not create window.crypto:', e.message);
                window.cryptoPolyfill = cryptoPolyfill;
                console.log('✅ Created window.cryptoPolyfill as fallback');
            }
        }

        // CRITICAL: Set up global references that SockJS might use
        const globalRefs = [window.global, window.globalThis, globalThis];
        globalRefs.forEach((globalRef, index) => {
            if (globalRef && typeof globalRef === 'object') {
                try {
                    if (!globalRef.crypto) {
                        globalRef.crypto = window.crypto || cryptoPolyfill;
                    } else if (!globalRef.crypto.randomBytes) {
                        globalRef.crypto.randomBytes = randomBytes;
                        globalRef.crypto.createHash = globalRef.crypto.createHash || createHash;
                    }
                    console.log(`✅ Set up crypto for global reference ${index}`);
                } catch (e) {
                    console.warn(`⚠️ Could not set up crypto for global reference ${index}:`, e.message);
                }
            }
        });

        // Strategy 4: Intercept require calls (for modules that use require('crypto'))
        if (typeof window.require === 'undefined') {
            window.require = function(module) {
                if (module === 'crypto') {
                    console.log('📦 Providing crypto module via require()');
                    return cryptoPolyfill;
                }
                throw new Error(`Module ${module} not found`);
            };
        }
    }

    // Node.js-like global
    if (typeof global !== 'undefined') {
        if (!global.crypto) {
            global.crypto = cryptoPolyfill;
        } else {
            global.crypto.randomBytes = global.crypto.randomBytes || randomBytes;
            global.crypto.createHash = global.crypto.createHash || createHash;
        }
    }

    // globalThis support
    if (typeof globalThis !== 'undefined') {
        if (!globalThis.crypto) {
            globalThis.crypto = cryptoPolyfill;
        } else {
            globalThis.crypto.randomBytes = globalThis.crypto.randomBytes || randomBytes;
            globalThis.crypto.createHash = globalThis.crypto.createHash || createHash;
        }
    }

    // Module exports for CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = cryptoPolyfill;
    }

    // AMD/RequireJS
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return cryptoPolyfill;
        });
    }

    // CRITICAL: Final verification and setup
    const verifySetup = () => {
        const cryptoSources = [
            { name: 'window.crypto', obj: window?.crypto },
            { name: 'global.crypto', obj: (typeof global !== 'undefined') ? global.crypto : null },
            { name: 'globalThis.crypto', obj: (typeof globalThis !== 'undefined') ? globalThis.crypto : null },
            { name: 'window.cryptoPolyfill', obj: window?.cryptoPolyfill }
        ];

        let hasWorkingCrypto = false;

        cryptoSources.forEach(source => {
            if (source.obj && typeof source.obj.randomBytes === 'function') {
                try {
                    const testBytes = source.obj.randomBytes(4);
                    if (testBytes && testBytes.length === 4) {
                        console.log(`✅ ${source.name}.randomBytes is working:`, testBytes);
                        hasWorkingCrypto = true;
                    }
                } catch (e) {
                    console.warn(`⚠️ ${source.name}.randomBytes failed test:`, e.message);
                }
            }
        });

        if (!hasWorkingCrypto) {
            console.error('❌ No working crypto.randomBytes found! This will cause SockJS to fail.');

            // Emergency fallback - monkey patch directly
            if (typeof window !== 'undefined') {
                window.crypto = window.crypto || {};
                window.crypto.randomBytes = randomBytes;
                console.log('🆘 Emergency: Force-added randomBytes to window.crypto');
            }
        } else {
            console.log('🔐 Crypto polyfill setup completed successfully!');
        }
    };

    // Run verification
    verifySetup();

    // Also run verification after a short delay to catch any overwrites
    if (typeof window !== 'undefined') {
        setTimeout(verifySetup, 100);
    }

})();