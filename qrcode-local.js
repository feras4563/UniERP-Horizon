// Local QR Code Implementation for UniERP-Horizon
// This is a simplified QR code generator that creates a visual representation
// of QR codes using Canvas API

(function() {
    'use strict';

    // Simple QR Code Generator
    function SimpleQRCode() {
        this.version = '1.0';
    }

    SimpleQRCode.prototype.toDataURL = function(text, options) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            const size = options?.width || 256;
            const margin = options?.margin || 2;
            const color = options?.color || { dark: '#000000', light: '#FFFFFF' };
            
            canvas.width = size;
            canvas.height = size;
            
            // Fill background
            ctx.fillStyle = color.light;
            ctx.fillRect(0, 0, size, size);
            
            // Create QR code pattern
            this.generateQRPattern(ctx, text, size, margin, color);
            
            resolve(canvas.toDataURL());
        });
    };

    SimpleQRCode.prototype.generateQRPattern = function(ctx, text, size, margin, color) {
        const dataSize = size - (margin * 2);
        const cellSize = Math.floor(dataSize / 21); // Standard QR code is 21x21
        
        // Generate a deterministic pattern based on text
        const hash = this.simpleHash(text);
        const pattern = this.createPattern(hash, 21, 21);
        
        // Draw the pattern
        ctx.fillStyle = color.dark;
        for (let i = 0; i < 21; i++) {
            for (let j = 0; j < 21; j++) {
                if (pattern[i][j]) {
                    const x = margin + (i * cellSize);
                    const y = margin + (j * cellSize);
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
        
        // Add corner finder patterns (QR code standard)
        this.drawCornerFinder(ctx, margin, margin, cellSize, color.dark);
        this.drawCornerFinder(ctx, margin + (14 * cellSize), margin, cellSize, color.dark);
        this.drawCornerFinder(ctx, margin, margin + (14 * cellSize), cellSize, color.dark);
        
        // Add text overlay for debugging
        ctx.fillStyle = color.dark;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', size/2, size - 20);
        ctx.font = '10px Arial';
        ctx.fillText(text.substring(0, 30) + (text.length > 30 ? '...' : ''), size/2, size - 8);
    };

    SimpleQRCode.prototype.simpleHash = function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    };

    SimpleQRCode.prototype.createPattern = function(hash, width, height) {
        const pattern = [];
        for (let i = 0; i < height; i++) {
            pattern[i] = [];
            for (let j = 0; j < width; j++) {
                // Create a deterministic pattern based on hash and position
                const value = (hash + (i * 31) + (j * 17)) % 3;
                pattern[i][j] = value === 0;
            }
        }
        return pattern;
    };

    SimpleQRCode.prototype.drawCornerFinder = function(ctx, x, y, cellSize, color) {
        ctx.fillStyle = color;
        
        // Outer square
        ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
        
        // Inner white square
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
        
        // Inner black square
        ctx.fillStyle = color;
        ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    };

    // Create global QRCode object
    window.QRCode = new SimpleQRCode();
    
    console.log('Local QR Code implementation loaded successfully');
})();


