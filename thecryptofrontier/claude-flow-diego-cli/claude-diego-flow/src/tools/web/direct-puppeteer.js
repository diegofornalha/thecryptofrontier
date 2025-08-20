import puppeteer from 'puppeteer';
import { BaseTool } from '../tool-interface';
export class DirectPuppeteer extends BaseTool {
    constructor() {
        super(...arguments);
        this.name = 'DirectPuppeteer';
        this.description = 'Controle direto do navegador com Puppeteer';
        this.browser = null;
        this.page = null;
    }
    async execute(params) {
        const { action, ...data } = params;
        try {
            switch (action) {
                case 'navigate':
                    return this.navigate(data);
                case 'screenshot':
                    return this.screenshot(data);
                case 'click':
                    return this.click(data);
                case 'type':
                    return this.type(data);
                case 'getContent':
                    return this.getContent(data);
                case 'waitForSelector':
                    return this.waitForSelector(data);
                case 'evaluate':
                    return this.evaluate(data);
                case 'close':
                    return this.closeBrowser();
                default:
                    throw new Error(`Ação não suportada: ${action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async ensureBrowser() {
        if (!this.browser || !this.browser.isConnected()) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1920, height: 1080 });
        }
    }
    async navigate(params) {
        this.validateParams(params, ['url']);
        await this.ensureBrowser();
        try {
            const response = await this.page.goto(params.url, {
                waitUntil: params.waitUntil || 'networkidle2',
                timeout: 30000
            });
            return {
                success: true,
                url: this.page.url(),
                title: await this.page.title(),
                status: response === null || response === void 0 ? void 0 : response.status()
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao navegar: ${error.message}`
            };
        }
    }
    async screenshot(params) {
        await this.ensureBrowser();
        try {
            let screenshotBuffer;
            if (params.selector) {
                const element = await this.page.$(params.selector);
                if (!element) {
                    throw new Error(`Seletor não encontrado: ${params.selector}`);
                }
                screenshotBuffer = await element.screenshot({
                    type: params.type || 'png',
                    quality: params.quality
                });
            }
            else {
                screenshotBuffer = await this.page.screenshot({
                    fullPage: params.fullPage || false,
                    type: params.type || 'png',
                    quality: params.quality
                });
            }
            const base64 = screenshotBuffer.toString('base64');
            return {
                success: true,
                screenshot: {
                    base64,
                    size: screenshotBuffer.length,
                    type: params.type || 'png'
                },
                url: this.page.url()
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao capturar screenshot: ${error.message}`
            };
        }
    }
    async click(params) {
        this.validateParams(params, ['selector']);
        await this.ensureBrowser();
        try {
            await this.page.waitForSelector(params.selector, {
                visible: true,
                timeout: 10000
            });
            await this.page.click(params.selector, params.options || {});
            // Aguardar possível navegação
            await this.page.waitForLoadState('domcontentloaded').catch(() => { });
            return {
                success: true,
                message: `Clique realizado em: ${params.selector}`,
                url: this.page.url()
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao clicar: ${error.message}`
            };
        }
    }
    async type(params) {
        this.validateParams(params, ['selector', 'text']);
        await this.ensureBrowser();
        try {
            await this.page.waitForSelector(params.selector, {
                visible: true,
                timeout: 10000
            });
            // Limpar campo antes de digitar
            await this.page.click(params.selector, { clickCount: 3 });
            await this.page.type(params.selector, params.text, params.options || {});
            return {
                success: true,
                message: `Texto digitado em: ${params.selector}`,
                text: params.text
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao digitar: ${error.message}`
            };
        }
    }
    async getContent(params) {
        await this.ensureBrowser();
        try {
            let content;
            if (params.selector) {
                await this.page.waitForSelector(params.selector, { timeout: 10000 });
                content = await this.page.evaluate((selector, type) => {
                    const element = document.querySelector(selector);
                    if (!element)
                        return '';
                    switch (type) {
                        case 'value':
                            return element.value || '';
                        case 'html':
                            return element.innerHTML;
                        default:
                            return element.textContent || '';
                    }
                }, params.selector, params.type || 'text');
            }
            else {
                // Pegar conteúdo da página toda
                if (params.type === 'html') {
                    content = await this.page.content();
                }
                else {
                    content = await this.page.evaluate(() => document.body.innerText);
                }
            }
            return {
                success: true,
                content,
                url: this.page.url(),
                title: await this.page.title()
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao obter conteúdo: ${error.message}`
            };
        }
    }
    async waitForSelector(params) {
        this.validateParams(params, ['selector']);
        await this.ensureBrowser();
        try {
            await this.page.waitForSelector(params.selector, params.options || {
                visible: true,
                timeout: 30000
            });
            return {
                success: true,
                message: `Seletor encontrado: ${params.selector}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Timeout esperando por: ${params.selector}`
            };
        }
    }
    async evaluate(params) {
        this.validateParams(params, ['code']);
        await this.ensureBrowser();
        try {
            const result = await this.page.evaluate(params.code, ...(params.args || []));
            return {
                success: true,
                result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao executar código: ${error.message}`
            };
        }
    }
    async closeBrowser() {
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            return {
                success: true,
                message: 'Navegador fechado com sucesso'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Falha ao fechar navegador: ${error.message}`
            };
        }
    }
    // Cleanup ao destruir
    async cleanup() {
        await this.closeBrowser();
    }
}
// Wrapper para compatibilidade
export class WebTool extends DirectPuppeteer {
    async navigate(url) {
        return this.execute({ action: 'navigate', url });
    }
    async screenshot(fullPage = false, selector) {
        return this.execute({ action: 'screenshot', fullPage, selector });
    }
    async click(selector) {
        return this.execute({ action: 'click', selector });
    }
    async type(selector, text) {
        return this.execute({ action: 'type', selector, text });
    }
    async getContent(selector) {
        return this.execute({ action: 'getContent', selector });
    }
}
