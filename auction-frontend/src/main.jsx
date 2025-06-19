// src/main.jsx - Polyfill mạnh mẽ cho crypto.randomBytes
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

// ✅ Polyfill MẠNH MẼ cho crypto.randomBytes
(function() {
    // Đảm bảo crypto object tồn tại
    if (typeof window !== 'undefined' && !window.crypto) {
        window.crypto = {};
    }

    if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomBytes) {
        // Tạo function randomBytes giống như Node.js
        window.crypto.randomBytes = function(size) {
            if (typeof size !== 'number' || size < 0) {
                throw new Error('Size must be a non-negative number');
            }

            const array = new Uint8Array(size);
            window.crypto.getRandomValues(array);

            // Tạo object giống Buffer của Node.js
            const buffer = Object.create(Array.prototype);
            buffer.length = size;

            // Copy data từ Uint8Array
            for (let i = 0; i < size; i++) {
                buffer[i] = array[i];
            }

            // Thêm các method cần thiết
            buffer.toString = function(encoding) {
                encoding = encoding || 'utf8';

                if (encoding === 'hex') {
                    return Array.from(array)
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                } else if (encoding === 'base64') {
                    return btoa(String.fromCharCode.apply(null, array));
                } else if (encoding === 'utf8' || encoding === 'utf-8') {
                    return String.fromCharCode.apply(null, array);
                } else {
                    return String.fromCharCode.apply(null, array);
                }
            };

            // Thêm method slice
            buffer.slice = function(start, end) {
                const sliced = array.slice(start, end);
                return window.crypto.randomBytes(0).constructor.from ?
                    window.crypto.randomBytes(0).constructor.from(sliced) :
                    Array.from(sliced);
            };

            // Thêm các property để giống Buffer
            Object.defineProperty(buffer, 'buffer', {
                value: array.buffer,
                enumerable: false
            });

            return buffer;
        };
    }

    // ✅ Polyfill cho các Node.js globals khác
    if (typeof global === 'undefined') {
        window.global = window;
    }

    if (typeof process === 'undefined') {
        window.process = {
            env: {},
            browser: true,
            version: '',
            versions: {},
            nextTick: function(callback) {
                setTimeout(callback, 0);
            }
        };
    }

    // ✅ Polyfill cho Buffer nếu cần
    if (typeof Buffer === 'undefined') {
        window.Buffer = {
            from: function(data) {
                if (typeof data === 'string') {
                    return Array.from(new TextEncoder().encode(data));
                }
                return Array.from(data);
            },
            isBuffer: function(obj) {
                return obj && typeof obj.length === 'number';
            }
        };
    }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <UserProvider>
                <App />
            </UserProvider>
        </BrowserRouter>
    </React.StrictMode>
);