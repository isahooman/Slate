/**
 * Normalizes RGB input to a standard RGB object
 * @param {object} rgb - RGB object with r, g, b properties
 * @returns {object} Normalized RGB object
 */
function normalizeRgb(rgb) {
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r || 0))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g || 0))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b || 0))),
  };
}

/**
 * Converts a hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {object} Object with r, g, b properties
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 255, g: 255, b: 255 };

  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Validate hex format
  if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) return { r: 255, g: 255, b: 255 };

  // Parse 3-digit hex
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

  // Parse 6-digit hex
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB values into a hex color code
 * @param {object} rgb - Object with r, g, b properties
 * @returns {string} Hex color code with #
 */
function rgbToHex(rgb) {
  const normalized = normalizeRgb(rgb);

  // Convert each rgb component to hex
  const r = normalized.r.toString(16).padStart(2, '0');
  const g = normalized.g.toString(16).padStart(2, '0');
  const b = normalized.b.toString(16).padStart(2, '0');

  // Return combined hex color code
  return `#${r}${g}${b}`;
}

/**
 * Convert RGB values to 256-color value
 * @param {object} rgb - RGB object with r, g, b properties
 * @returns {number} 256-color value
 */
function rgbTo256(rgb) {
  const normalized = normalizeRgb(rgb);

  // Grayscale (0-7, 232-255)
  if (normalized.r === normalized.g && normalized.g === normalized.b) {
    if (normalized.r < 8) return 16;
    if (normalized.r > 248) return 231;
    return Math.round(((normalized.r - 8) / 247) * 24) + 232;
  }

  // Color cube (16-231)
  const red = Math.min(5, Math.floor(normalized.r / 51));
  const green = Math.min(5, Math.floor(normalized.g / 51));
  const blue = Math.min(5, Math.floor(normalized.b / 51));

  // Calculate 256-color value
  return 16 + 36 * red + 6 * green + blue;
}

/**
 * Convert a 256-color value to RGB
 * @param {number} code - 256-color value (0-255)
 * @returns {object} RGB object with r, g, b properties
 */
function color256ToRgb(code) {
  // Ensure valid input
  code = Math.max(0, Math.min(255, Math.floor(Number(code) || 0)));

  // Standard colors (0-15)
  if (code < 16) {
    const isIntense = code >= 8;
    const baseCode = isIntense ? code - 8 : code;
    const intensity = isIntense ? 255 : 128;

    // White and gray
    if (baseCode === 7) {
      const value = isIntense ? 255 : 192;
      return { r: value, g: value, b: value };
    }

    return {
      r: (baseCode & 1) * intensity,
      g: ((baseCode & 2) >> 1) * intensity,
      b: ((baseCode & 4) >> 2) * intensity,
    };
  }

  // Color cube (16-231)
  if (code < 232) {
    const index = code - 16;
    const r = Math.floor(index / 36);
    const g = Math.floor(index / 6) % 6;
    const b = index % 6;

    // Convert to RGB values
    return {
      r: r === 0 ? 0 : r * 40 + 55,
      g: g === 0 ? 0 : g * 40 + 55,
      b: b === 0 ? 0 : b * 40 + 55,
    };
  }

  // Grayscale (232-255)
  const value = (code - 232) * 10 + 8;
  return { r: value, g: value, b: value };
}

/**
 * Convert a color to ANSI escape code for foreground text
 * @param {object|string|number} color - Color input (hex, RGB object, or 256-color value)
 * @returns {string} ANSI color code
 */
function toAnsi(color) {
  const prefix = '38';

  if (typeof color === 'string') {
    // Hex to ANSI
    const { r, g, b } = hexToRgb(color);
    return `\x1b[${prefix};2;${r};${g};${b}m`;
  } else if (color && typeof color === 'object' && 'r' in color && 'g' in color && 'b' in color) {
    // RGB to ANSI
    const rgb = normalizeRgb(color);
    return `\x1b[${prefix};2;${rgb.r};${rgb.g};${rgb.b}m`;
  } else if (typeof color === 'number' || (typeof color === 'string' && !isNaN(color))) {
    // 256-color to ANSI
    const code = Math.max(0, Math.min(255, Math.floor(Number(color))));
    return `\x1b[${prefix};5;${code}m`;
  }

  // Default to white if invalid input
  return `\x1b[${prefix};2;255;255;255m`;
}

/**
 * Reset ANSI formatting
 * @returns {string} ANSI reset code
 */
function resetAnsi() {
  return '\x1b[0m';
}

module.exports = {
  hexToRgb,
  rgbToHex,
  rgbTo256,
  color256ToRgb,
  toAnsi,
  resetAnsi,
  normalizeRgb,
};
