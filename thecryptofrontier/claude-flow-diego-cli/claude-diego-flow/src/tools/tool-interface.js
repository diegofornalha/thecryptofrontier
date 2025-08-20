export class BaseTool {
    validateParams(params, required) {
        for (const param of required) {
            if (!params[param]) {
                throw new Error(`Parâmetro obrigatório ausente: ${param}`);
            }
        }
    }
}
