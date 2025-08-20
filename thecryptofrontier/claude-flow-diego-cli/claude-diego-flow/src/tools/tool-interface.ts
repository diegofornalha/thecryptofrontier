export interface ToolInterface {
  name: string;
  description: string;
  execute(params: any): Promise<any>;
}

export interface ToolFactory {
  createTool(type: string): ToolInterface;
}

export abstract class BaseTool implements ToolInterface {
  abstract name: string;
  abstract description: string;
  
  abstract execute(params: any): Promise<any>;
  
  protected validateParams(params: any, required: string[]): void {
    for (const param of required) {
      if (!params[param]) {
        throw new Error(`Parâmetro obrigatório ausente: ${param}`);
      }
    }
  }
}
