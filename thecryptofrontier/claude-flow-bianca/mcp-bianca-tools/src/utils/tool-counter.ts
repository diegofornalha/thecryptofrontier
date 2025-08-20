import { toolHandlers } from '../tools/index.js';

export interface ToolStats {
  total: number;
  categories: {
    puppeteer_basic: number;
    strapi_tools: number;
    cryptofrontier_tools: number;
    browser: number;
    agents: number;
  };
  evolution: {
    initial_tools: number;
    custom_skills_added: number;
    growth_percentage: number;
  };
}

export function getToolStats(): ToolStats {
  const tools = Object.keys(toolHandlers);
  
  const puppeteerBasic = tools.filter(tool => 
    tool.startsWith('puppeteer_') || tool === 'open_browser'
  ).length;
  
  const strapiTools = tools.filter(tool => 
    tool.startsWith('strapi_')
  ).length;
  
  const cryptofrontierTools = tools.filter(tool => 
    tool.startsWith('cryptofrontier_')
  ).length;
  
  const browser = tools.filter(tool => 
    tool.startsWith('browser_')
  ).length;
  
  const agents = tools.filter(tool => 
    tool.startsWith('agents_')
  ).length;
  
  const initialTools = 12; // Ferramentas iniciais do MCP
  const currentTotal = tools.length;
  const customSkillsAdded = strapiTools + cryptofrontierTools;
  const growthPercentage = Math.round(((currentTotal - initialTools) / initialTools) * 100);
  
  return {
    total: currentTotal,
    categories: {
      puppeteer_basic: puppeteerBasic,
      strapi_tools: strapiTools,
      cryptofrontier_tools: cryptofrontierTools,
      browser: browser,
      agents: agents
    },
    evolution: {
      initial_tools: initialTools,
      custom_skills_added: customSkillsAdded,
      growth_percentage: growthPercentage
    }
  };
}

export function displayToolStats(): string {
  const stats = getToolStats();
  
  return `
🔧 **BIANCA TOOLS - ESTATÍSTICAS EVOLUTIVAS**

📊 **TOTAL DE FERRAMENTAS:** ${stats.total}

📋 **CATEGORIAS:**
   🔹 Puppeteer Básico: ${stats.categories.puppeteer_basic} ferramentas
   📝 Ferramentas Strapi: ${stats.categories.strapi_tools} ferramentas
   🚀 Ferramentas CryptoFrontier: ${stats.categories.cryptofrontier_tools} ferramentas
   🌐 Browser: ${stats.categories.browser} ferramentas
   🤖 Agents: ${stats.categories.agents} ferramentas

📈 **EVOLUÇÃO:**
   ⚡ Ferramentas Iniciais: ${stats.evolution.initial_tools}
   🎯 Habilidades Customizadas Adicionadas: ${stats.evolution.custom_skills_added}
   📊 Crescimento: +${stats.evolution.growth_percentage}%

🎯 **PRÓXIMAS HABILIDADES PLANEJADAS:**
   • Strapi: Editor Avançado de Posts
   • Strapi: Gerenciador de Mídia
   • CryptoFrontier: Monitor RSS
   • CryptoFrontier: Análise de Tendências
   • Integração: Webhook Automation
`;
}

export function logToolEvolution(): void {
  console.log(displayToolStats());
} 