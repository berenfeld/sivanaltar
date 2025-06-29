/**
 * Common JavaScript utilities for the frontend
 */

/**
 * Encode content to base64 for transmission to server
 * @param {string} content The content to encode
 * @returns {string} Base64 encoded content
 */
function encodeContent(content) {
    if (!content) {
        return '';
    }

    // Convert string to UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);

    // Convert bytes to base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

/**
 * Decode content from base64 received from server
 * @param {string} base64Content The base64 encoded content
 * @returns {string} Decoded content
 */
function decodeContent(base64Content) {
    if (!base64Content) {
        return '';
    }

    try {
        // Decode from base64
        const binary = atob(base64Content);

        // Convert binary to UTF-8 bytes
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // Convert bytes to string
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    } catch (error) {
        console.error('Error decoding base64 content:', error);
        // If decoding fails, return original content
        return base64Content;
    }
}

/**
 * Encode image file to base64 data URL
 * @param {File} file The image file to encode
 * @returns {Promise<string>} Promise that resolves to base64 data URL
 */
function encodeImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}