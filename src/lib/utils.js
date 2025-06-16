import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
// Função para converter hex para HSL em formato de string
export function hexToHsl(hex) {
    // Remover o '#' se presente
    hex = hex.replace(/^#/, "");
    // Converter para RGB
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255;
        g = parseInt(hex[1] + hex[1], 16) / 255;
        b = parseInt(hex[2] + hex[2], 16) / 255;
    }
    else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    // Encontrar min e max
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    // Calcular H, S, L
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h = h / 6;
    }
    // Converter para o formato de string usado no Tailwind
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
}
// Função para obter a cor de texto recomendada (claro ou escuro) com base na cor de fundo
export function getTextColor(bgHex) {
    // Remover o '#' se presente
    const hex = bgHex.replace(/^#/, "");
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    }
    else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    // Fórmula de contraste baseada na percepção humana
    // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
    // A fórmula YIQ é usada pela WCAG para determinar o contraste de cores
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    // Valor YIQ de 128 é o ponto médio, acima desse valor o texto deve ser escuro
    return yiq >= 128 ? "dark" : "light";
}
// Função para ajustar a saturação de uma cor HSL
export function adjustSaturation(hslString, amount) {
    const [h, s, l] = hslString.split(' ').map(part => parseFloat(part));
    const newS = Math.max(0, Math.min(100, s + amount));
    return `${h} ${newS}% ${l}%`;
}
// Função para ajustar a luminosidade de uma cor HSL
export function adjustLightness(hslString, amount) {
    const [h, s, l] = hslString.split(' ').map(part => parseFloat(part));
    const newL = Math.max(0, Math.min(100, l + amount));
    return `${h} ${s}% ${newL}%`;
}
