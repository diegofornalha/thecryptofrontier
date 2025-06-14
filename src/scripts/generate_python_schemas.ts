import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment, ArrayLiteralExpression, StringLiteral, Identifier, Node, CallExpression } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuração ---
const schemasSourceDir = path.join(__dirname, 'src', 'strapi', 'schemaTypes');
const outputDir = path.join(__dirname, 'framework_crewai', 'src', 'generated_strapi_schemas');
const sourceFileGlob = path.join(schemasSourceDir, '**/*.ts');
const pythonClassPerFile = false;

// --- Funções Auxiliares ---

/**
 * Converte um valor JS simples para sua representação string em Python.
 */
function jsToPythonValue(value: any): string {
    if (typeof value === 'string') {
        // Escapa contrabarras e depois aspas simples para Python
        const escapedValue = value.replace(/\\/g, '\\').replace(/'/g, "\\'");
        return `'${escapedValue}'`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString(); // Python boolean é True/False (capitalizado, mas JSON converte para true/false)
                                 // No nosso caso, vamos manter minúsculo por simplicidade inicial e focar na estrutura
                                 // O Python dict literal aceita true/false
    }
    if (value === null) {
        return 'None';
    }
    if (Array.isArray(value)) {
        return `[${value.map(jsToPythonValue).join(', ')}]`;
    }
    if (typeof value === 'object') {
        // Converte um objeto simples para um dicionário Python
        const items = Object.entries(value)
            .map(([key, val]) => `${jsToPythonValue(key)}: ${jsToPythonValue(val)}`)
            .join(', ');
        return `{${items}}`;
    }
    // Retorna repr para outros tipos (pode precisar de ajuste)
    return JSON.stringify(value); // Fallback, pode não ser Python válido sempre
}


/**
 * Extrai as informações de um nó PropertyAssignment (chave: valor) de um objeto literal.
 */
function extractPropertyData(prop: PropertyAssignment): { name: string; value: any } | null {
    const nameNode = prop.getNameNode();
    const initializer = prop.getInitializer();

    if (!initializer) return null;

    let name: string | undefined;
    if (Node.isIdentifier(nameNode)) {
        name = nameNode.getText();
    } else if (Node.isStringLiteral(nameNode)) {
        name = nameNode.getLiteralValue();
    }
    if (!name) return null;

    // Se o inicializador é uma chamada para defineField(obj) ou defineType(obj), pegamos o obj diretamente.
    if (Node.isCallExpression(initializer)) {
        const callExpr = initializer as CallExpression;
        const expr = callExpr.getExpression();
        if (Node.isIdentifier(expr) && (expr.getText() === 'defineField' || expr.getText() === 'defineType')) {
            const firstArg = callExpr.getArguments()[0];
            if (firstArg && Node.isObjectLiteralExpression(firstArg)) {
                // Processa o objeto argumento da chamada defineField/defineType
                const parsedObject = parseObjectLiteral(firstArg as ObjectLiteralExpression);
                // Retorna o objeto parseado como o valor desta propriedade
                return parsedObject ? { name, value: parsedObject } : { name, value: initializer.getText() };
            }
        }
    }

    // Tenta processar literais ou estruturas conhecidas sem depender de eval para chamadas
    try {
        if (initializer.isKind(SyntaxKind.StringLiteral) ||
            initializer.isKind(SyntaxKind.NumericLiteral) ||
            initializer.isKind(SyntaxKind.TrueKeyword) ||
            initializer.isKind(SyntaxKind.FalseKeyword) ||
            initializer.isKind(SyntaxKind.NullKeyword)) {
            // Usar getLiteralValue() ou getText() para literais simples em vez de eval
             if (initializer.isKind(SyntaxKind.StringLiteral)){
                 return { name, value: (initializer as StringLiteral).getLiteralValue() };
             } else if (initializer.isKind(SyntaxKind.NullKeyword)) {
                return { name, value: null }; // Converte para null JS, que vira None Python
             } else {
                 // Para Numeric, True, False - getText() e converter se necessário
                 // (jsToPythonValue já trata boolean/number stringificados)
                 return { name, value: initializer.getText() }; 
             }
        } else if (initializer.isKind(SyntaxKind.ArrayLiteralExpression)) {
            // Para arrays, processamos cada elemento recursivamente
            const arrayLiteral = initializer as ArrayLiteralExpression;
            const elements = arrayLiteral.getElements().map(element => {
                // Se o elemento for uma chamada defineField/defineType, extrai o argumento objeto
                if (Node.isCallExpression(element)) {
                    const callExpr = element as CallExpression;
                    const expr = callExpr.getExpression();
                    if (Node.isIdentifier(expr) && (expr.getText() === 'defineField' || expr.getText() === 'defineType')) {
                        const firstArg = callExpr.getArguments()[0];
                        if (firstArg && Node.isObjectLiteralExpression(firstArg)) {
                            return parseObjectLiteral(firstArg as ObjectLiteralExpression);
                        }
                    }
                } 
                // Se for um objeto literal, parseia
                else if (Node.isObjectLiteralExpression(element)) {
                    return parseObjectLiteral(element as ObjectLiteralExpression);
                } 
                // Se for literal simples, extrai o valor
                else if (Node.isStringLiteral(element)) { return (element as StringLiteral).getLiteralValue(); }
                else if (Node.isNullLiteral(element)) { return null; }
                 // Add more literal types if needed (Numeric, Boolean, etc.)
                 // else if (Node.isNumericLiteral(element)) { return parseFloat(element.getText()); } // Example
                
                // Fallback: retorna o texto do elemento se não for reconhecido/processado
                return element.getText(); 
            }).filter(value => value !== undefined); // Filtra undefined, mas mantém null
            return { name, value: elements };
        } else if (initializer.isKind(SyntaxKind.ObjectLiteralExpression)) {
            // Para objetos literais, parseamos diretamente
            const parsedObject = parseObjectLiteral(initializer as ObjectLiteralExpression);
            return parsedObject ? { name, value: parsedObject } : { name, value: initializer.getText() };
        }

        // Fallback para tipos de inicializadores não explicitamente tratados
        console.warn(`  [Warn] Propriedade '${name}' com tipo de inicializador não tratado diretamente: ${initializer.getKindName()}. Usando texto literal.`);
        return { name, value: initializer.getText() };

    } catch (e: any) {
        console.error(`  [Erro] Falha ao processar propriedade '${name}': ${e.message}. Usando texto literal: ${initializer.getText()}`);
        return { name, value: initializer.getText() };
    }
}


/**
 * Extrai nome, tipo e outras propriedades relevantes de um objeto de definição de schema/field.
 */
function extractSimplifiedSchemaInfo(schemaDefinition: any): Record<string, any> | null {
    if (typeof schemaDefinition !== 'object' || schemaDefinition === null) {
        // Se for apenas uma referência de tipo (ex: { type: 'string' })
        if (typeof schemaDefinition?.type === 'string') {
             return { type: schemaDefinition.type };
        }
        console.warn(`  [Warn] Definição de schema inválida encontrada:`, schemaDefinition);
        return null;
    }

    const schemaInfo: Record<string, any> = {};
    // Tenta extrair propriedades comuns do Strapi diretamente
    for (const key of ['name', 'title', 'type', 'options', 'to', 'of', 'fields']) {
         if (key in schemaDefinition) {
            let value = schemaDefinition[key];
             // Simplificações e processamento recursivo
            if (key === 'to' && typeof value === 'object' && value !== null) {
                if (Array.isArray(value) && value.length > 0 && typeof value[0]?.type === 'string') {
                    value = value[0].type; // Pega o primeiro tipo se for array
                } else if (!Array.isArray(value) && typeof (value as any)?.type === 'string') {
                    value = (value as any).type; // Pega o tipo diretamente
                }
            } else if (key === 'of' && Array.isArray(value)) {
                 value = value.map(item => extractSimplifiedSchemaInfo(item)).filter(Boolean); // Processa itens em 'of'
             } else if (key === 'fields' && Array.isArray(value)) {
                 value = value.map(field => extractSimplifiedSchemaInfo(field)).filter(Boolean); // Processa campos recursivamente
            }
             schemaInfo[key] = value;
         }
    }

     // Se type não foi encontrado e só há 'type' (como em of: [{ type: 'image' }])
    if (!schemaInfo.type && schemaDefinition.type) {
        schemaInfo.type = schemaDefinition.type;
    }

    // Remove campos vazios ou nulos que não sejam intencionais
    Object.keys(schemaInfo).forEach(key => {
        if (schemaInfo[key] === undefined || schemaInfo[key] === null) {
            // delete schemaInfo[key]; // Decide se quer remover ou manter como None/null
        }
    });

    return Object.keys(schemaInfo).length > 0 ? schemaInfo : null;
}


/**
 * Analisa um ObjectLiteralExpression (o objeto passado para defineType/defineField/objeto literal)
 * e extrai seus dados como um objeto JS.
 */
function parseObjectLiteral(node: ObjectLiteralExpression): Record<string, any> | null {
    const data: Record<string, any> = {};
    let extractedSomething = false;

    node.getProperties().forEach(prop => {
        // Processa apenas PropertyAssignment por enquanto
        if (Node.isPropertyAssignment(prop)) {
            const propData = extractPropertyData(prop as PropertyAssignment);
            if (propData) {
                // Simplifica refs/arrays diretamente aqui se o valor for um objeto simples
                if ((propData.name === 'to' || propData.name === 'of') && typeof propData.value === 'object' && propData.value !== null) {
                    if (propData.name === 'to') {
                         // Simplifica 'to: { type: 'someType' }' para 'to: 'someType''
                         // Simplifica 'to: [{ type: 'someType' }]' para 'to: 'someType'' (pegando o primeiro)
                        if (Array.isArray(propData.value) && propData.value.length > 0 && propData.value[0].type) {
                             data[propData.name] = propData.value[0].type;
                        } else if (!Array.isArray(propData.value) && propData.value.type) {
                            data[propData.name] = propData.value.type;
                         } else {
                             data[propData.name] = propData.value; // Mantém como está se não reconhecer .type
                         }
                     } else { // propData.name === 'of'
                         // Mantém o array processado por extractPropertyData
                         data[propData.name] = propData.value;
                     }
                } else {
                    data[propData.name] = propData.value;
                }
                extractedSomething = true;
            }
        }
        // Adicionar suporte para ShorthandPropertyAssignment ou SpreadAssignment se necessário
    });

    return extractedSomething ? data : null;
}

/**
 * Converte um objeto JS (representando o schema) em uma string de dicionário Python.
 */
function objectToPythonDictString(obj: Record<string, any>, indentLevel = 1): string {
    const indent = '    '.repeat(indentLevel); // 4 espaços por nível
    const entries = Object.entries(obj)
        .map(([key, value]) => {
            const pythonKey = jsToPythonValue(key);
            let pythonValue: string;

            if (Array.isArray(value)) {
                // Formatação especial para listas (arrays)
                if (value.length === 0) {
                    pythonValue = '[]';
                } else {
                    const items = value.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return objectToPythonDictString(item, indentLevel + 1);
                        } else {
                            return jsToPythonValue(item);
                        }
                    }).join(',\n' + indent + '    '); // Adiciona nova linha e indentação para cada item
                    pythonValue = `[\n${indent}    ${items}\n${indent}]`;
                }
            } else if (typeof value === 'object' && value !== null) {
                pythonValue = objectToPythonDictString(value, indentLevel + 1);
            } else {
                pythonValue = jsToPythonValue(value);
            }
            return `${indent}${pythonKey}: ${pythonValue}`;
        })
        .join(',\n'); // Nova linha entre as entradas do dicionário

    return `{\n${entries}\n${'    '.repeat(indentLevel - 1)}}`;
}


// --- Lógica Principal ---

console.log('Iniciando geração de schemas Python...');

// Inicializa o projeto ts-morph
const project = new Project({
    // Opções do compilador podem ser adicionadas aqui se necessário
    // compilerOptions: { ... }
});

// Adiciona os arquivos de schema TS ao projeto
console.log(`Procurando por arquivos de schema em: ${sourceFileGlob}`);
project.addSourceFilesAtPaths(sourceFileGlob);
project.addSourceFilesAtPaths(path.join(schemasSourceDir, 'index.ts')); // Inclui o index.ts principal

// Garante que o diretório de saída exista
fs.mkdirSync(outputDir, { recursive: true });
console.log(`Diretório de saída: ${outputDir}`);

const allSchemaInfo: Array<{ name: string; data: Record<string, any>; filename: string }> = [];

// Itera sobre cada arquivo de origem encontrado
project.getSourceFiles().forEach(sourceFile => {
    const relativePath = path.relative(schemasSourceDir, sourceFile.getFilePath());
    // Ignora o index.ts principal na geração direta de arquivos
    if (path.basename(sourceFile.getFilePath()) === 'index.ts' && sourceFile.getDirectoryPath() === schemasSourceDir) {
        console.log(`Ignorando arquivo de índice principal: ${relativePath}`);
        return;
    }
    // Ignora arquivos fora do diretório de schemas (ex: node_modules se não filtrado)
     if (!sourceFile.getFilePath().startsWith(schemasSourceDir)) {
         console.log(`Ignorando arquivo fora do diretório de schemas: ${sourceFile.getFilePath()}`);
         return;
     }


    console.log(`Analisando arquivo: ${relativePath}`);

    // Encontra a chamada para defineType ou defineField (export default normalmente)
    const defaultExport = sourceFile.getDefaultExportSymbol();
    let definitionObjectNode: ObjectLiteralExpression | null = null;

    if (defaultExport) {
        const declarations = defaultExport.getDeclarations();
        if (declarations.length > 0) {
            const exportAssignment = declarations[0];
            // Procura pela chamada de defineType/defineField dentro da declaração de export default
            const callExpression = exportAssignment.getFirstDescendantByKind(SyntaxKind.CallExpression);
            if (callExpression) {
                const arg = callExpression.getArguments()[0];
                if (arg && arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
                    definitionObjectNode = arg as ObjectLiteralExpression;
                }
            } else if (exportAssignment.isKind(SyntaxKind.ObjectLiteralExpression)) {
                 // Caso o export default seja diretamente o objeto (menos comum com defineType)
                definitionObjectNode = exportAssignment as ObjectLiteralExpression;
            }
        }
    }

    // Se não encontrou no export default, procura por qualquer chamada a defineType/defineField
    if (!definitionObjectNode) {
         sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
             const expression = callExpr.getExpression();
             if (Node.isIdentifier(expression) && (expression.getText() === 'defineType' || expression.getText() === 'defineField')) {
                 const arg = callExpr.getArguments()[0];
                 if (arg && arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
                     definitionObjectNode = arg as ObjectLiteralExpression;
                     return;
                 }
             }
         });
    }


    if (definitionObjectNode) {
        console.log(`  Encontrada definição de schema/field.`);
        const schemaData = parseObjectLiteral(definitionObjectNode);

        if (schemaData && schemaData.name && typeof schemaData.name === 'string') {
            const schemaName = schemaData.name;
            const pythonFileName = `${schemaName}_schema.py`;
            const outputFilePath = path.join(outputDir, pythonFileName);

            // Converte o objeto JS para uma string de dicionário Python
            const pythonDictString = objectToPythonDictString(schemaData);

             let pythonFileContent = `# -*- coding: utf-8 -*-\n`; // Garante UTF-8
            pythonFileContent += `# Gerado automaticamente a partir de ${path.relative(__dirname, sourceFile.getFilePath())}\n`;
            pythonFileContent += `# NÃO EDITE MANUALMENTE - Altere o schema TS e regenere.\n\n`;

            if (pythonClassPerFile) {
                 // Opção: Gerar como classe
                 // pythonFileContent += `class ${schemaName.charAt(0).toUpperCase() + schemaName.slice(1)}Schema:\n`;
                 // pythonFileContent += `    schema = ${pythonDictString}\n`;
                 throw new Error("Geração de classes Python ainda não implementada.");
             } else {
                 // Opção: Gerar como dicionário
                 pythonFileContent += `schema = ${pythonDictString}\n`;
            }

            // Salva o arquivo Python
            try {
                fs.writeFileSync(outputFilePath, pythonFileContent);
                console.log(`  -> Schema '${schemaName}' salvo em: ${path.relative(__dirname, outputFilePath)}`);
                 allSchemaInfo.push({ name: schemaName, data: schemaData, filename: pythonFileName });
            } catch (err) {
                console.error(`  [Erro] Falha ao escrever o arquivo ${pythonFileName}:`, err);
            }
        } else {
            console.warn(`  [Warn] Definição de schema encontrada, mas sem propriedade 'name' válida ou schemaData nulo.`);
        }
    } else {
        console.warn(`  [Warn] Nenhuma chamada defineType/defineField contendo ObjectLiteralExpression encontrada em ${relativePath}`);
    }
});

// Gera o arquivo __init__.py para o pacote Python
const initFilePath = path.join(outputDir, '__init__.py');
let initFileContent = `# -*- coding: utf-8 -*-\n`;
initFileContent += `# Gerado automaticamente - NÃO EDITE MANUALMENTE\n`;
initFileContent += `# Este arquivo torna o diretório 'generated_strapi_schemas' um pacote Python\n`;
initFileContent += `# e importa/reexporta todos os schemas gerados.\n\n`;
initFileContent += `import importlib\n`;
initFileContent += `import pkgutil\n\n`;
initFileContent += `__all__ = []\n`;
initFileContent += `loaded_schemas = {}\n\n`;
initFileContent += `# Importa dinamicamente todos os módulos _schema.py neste diretório\n`;
initFileContent += `for _, module_name, _ in pkgutil.iter_modules(__path__):\n`;
initFileContent += `    if module_name.endswith('_schema'):\n`;
initFileContent += `        try:\n`;
initFileContent += `            module = importlib.import_module(f'.{module_name}', __name__)\n`;
initFileContent += `            if hasattr(module, 'schema') and isinstance(module.schema, dict) and 'name' in module.schema:\n`;
initFileContent += `                schema_name = module.schema['name']\n`;
initFileContent += `                # Define uma variável com o nome do schema (ex: post = module.schema)\n`;
initFileContent += `                globals()[schema_name] = module.schema \n`;
initFileContent += `                # Adiciona o nome ao __all__ para import *\n`;
initFileContent += `                __all__.append(schema_name)\n`;
initFileContent += `                # Armazena no dicionário para acesso fácil\n`;
initFileContent += `                loaded_schemas[schema_name] = module.schema\n`;
initFileContent += `            else:\n`;
initFileContent += `               print(f"Aviso: Módulo {module_name} não tem um dicionário 'schema' com 'name' válido.")\n`;
initFileContent += `        except Exception as e:\n`;
initFileContent += `            print(f"Erro ao importar o schema {module_name}: {e}")\n\n`;

initFileContent += `# Você pode acessar os schemas individualmente (ex: from generated_strapi_schemas import post)\n`;
initFileContent += `# Ou acessar todos através do dicionário loaded_schemas (ex: from generated_strapi_schemas import loaded_schemas)\n`;

try {
    fs.writeFileSync(initFilePath, initFileContent);
    console.log(`Arquivo __init__.py gerado em: ${path.relative(__dirname, initFilePath)}`);
} catch (err) {
    console.error(`[Erro] Falha ao escrever o arquivo __init__.py:`, err);
}


// --- Limpeza Opcional ---
// Comente ou remova esta seção se não quiser remover o diretório antigo automaticamente.
const oldSchemaDir = path.join(__dirname, 'framework_crewai', 'src', 'strapi', 'schemaTypes');
if (fs.existsSync(oldSchemaDir)) {
     try {
         // fs.rmSync(oldSchemaDir, { recursive: true, force: true }); // Use com cuidado!
         console.log(`[Aviso] O diretório antigo '${oldSchemaDir}' ainda existe. Remova-o manualmente após verificar se a geração funcionou.`);
         // Descomente a linha fs.rmSync acima para remover automaticamente.
     } catch (err) {
         console.error(`[Erro] Falha ao remover o diretório antigo ${oldSchemaDir}:`, err);
     }
}


console.log('\nGeração de schemas Python concluída.');
console.log(`Total de schemas processados: ${allSchemaInfo.length}`);
console.log('Próximos passos:');
console.log('1. Verifique os arquivos .py gerados em:', outputDir);
console.log('2. Modifique seu script Python em \'framework_crewai\' para importar os schemas de \'generated_strapi_schemas\'.');
console.log('   Exemplo: from generated_strapi_schemas import post, author');
console.log('   Ou: from generated_strapi_schemas import loaded_schemas');
console.log('       meu_post = {"_type": loaded_schemas["post"]["name"], ...}');
console.log('3. Remova o diretório antigo: \'framework_crewai/src/strapi/schemaTypes\'');
console.log('4. Se ainda não o fez, adicione um script ao package.json para executar este gerador:');
console.log('   "generate-py-schemas": "ts-node ./generate_python_schemas.ts"');
console.log('5. Execute \'npm run generate-py-schemas\' (ou yarn) sempre que alterar os schemas TS.'); 