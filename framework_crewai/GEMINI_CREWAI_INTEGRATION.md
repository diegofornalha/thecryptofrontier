# Configurando Google Gemini com CrewAI

Este documento detalha as soluções e boas práticas para integrar com sucesso os modelos Google Gemini com o framework CrewAI.

## Problemas Comuns na Integração

Durante a configuração inicial, vários erros podem surgir, incluindo:

1.  **`litellm.BadRequestError: LLM Provider NOT provided...`**: O LiteLLM (usado internamente pelo CrewAI) não consegue identificar o provedor correto para o modelo Gemini especificado quando não configurado corretamente.
2.  **Prefixo `models/` Indevido**: Em algumas configurações, o CrewAI/LiteLLM pode adicionar incorretamente o prefixo `models/` ao nome do modelo (ex: `models/gemini-1.5-flash`), causando falha na chamada da API.
3.  **`litellm.APIConnectionError: GeminiException - [Errno -2] Name or service not known`**: Este erro, que pode ocorrer ao tentar certas soluções alternativas (workarounds), geralmente indica um problema de resolução de DNS ou conectividade de rede.

## Solução Principal: Configuração Direta com `crewai.llm.LLM`

A solução mais estável e direta, especialmente com versões mais recentes do CrewAI, envolve usar a classe `LLM` fornecida pelo próprio CrewAI.

**Passos:**

1.  **Importar `LLM`**: Certifique-se de importar a classe correta:
    ```python
    from crewai.llm import LLM
    ```

2.  **Variáveis de Ambiente**: Garanta que a chave da API do Gemini esteja definida na variável de ambiente `GEMINI_API_KEY`. É recomendado também definir `GOOGLE_API_KEY` com o mesmo valor por compatibilidade:
    ```python
    import os
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        os.environ["GOOGLE_API_KEY"] = gemini_api_key
    else:
        raise ValueError("Variável de ambiente GEMINI_API_KEY não definida!")
    ```

3.  **Instanciar `LLM`**: Crie uma instância da classe `LLM`, especificando o modelo **com o prefixo `gemini/`**. Verifique o nome exato do modelo que funciona para sua chave API (ex: `gemini-1.5-flash` ou `gemini-pro`).
    ```python
    llm_instance = LLM(
        model="gemini/gemini-1.5-flash", # Use o prefixo gemini/ seguido do nome do modelo
        config={
            'api_key': gemini_api_key, 
            'temperature': 0.7, # Outros parâmetros de configuração aqui
            # 'max_rpm': 50, # Opcional: para não estourar limites (verificar se suportado diretamente aqui ou via config do Langchain)
        }
    )
    ```
    *Nota: Usamos `gemini/gemini-1.5-flash` porque foi o modelo confirmado via `curl` em nossos testes.*

4.  **Passar `llm` Explicitamente**: Ao definir seus Agentes e suas Crews, passe a instância `llm_instance` para o parâmetro `llm`:
    ```python
    from crewai import Agent, Crew
    # ... (código de instanciação do llm_instance)
    agente_exemplo = Agent(
        # ... (configurações do agente)
        llm=llm_instance
    )
    crew_exemplo = Crew(
        agents=[agente_exemplo],
        tasks=[tarefa_exemplo],
        llm=llm_instance
    )
    ```

## Abordagem Alternativa: Usando `langchain-google-genai`

Antes da classe `crewai.llm.LLM` ser a forma principal, ou para configurações mais granulares, a integração via `langchain-google-genai` é comum.

1.  **Instalação**: Certifique-se de ter `langchain-google-genai` instalado (`pip install langchain-google-genai`).

2.  **Importação e Configuração do LLM no Código Python**:
    ```python
    from langchain_google_genai import ChatGoogleGenerativeAI
    import os

    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("Variável de ambiente GEMINI_API_KEY não definida!")
    # Definir GOOGLE_API_KEY também é uma boa prática se não for feito automaticamente
    os.environ["GOOGLE_API_KEY"] = gemini_api_key 

    llm_langchain = ChatGoogleGenerativeAI(
        model="gemini-pro",  # ou "gemini-1.5-flash", etc.
        google_api_key=gemini_api_key, # Passar explicitamente também é possível
        temperature=0.7,
        # max_rpm=50, # Para não estourar limites de requisições por minuto
        # use_system_prompt=True, # Verificar documentação do modelo Gemini específico para suporte a system prompt
        # respect_context_window=True # Importante para gerenciar o tamanho da janela de contexto
    )
    ```

3.  **Definição de Agentes no CrewAI**: Use a instância `llm_langchain` ao criar seus agentes:
    ```python
    from crewai import Agent

    agente_analista = Agent(
        role='Analista de Mercado',
        goal='Identificar tendências em IA',
        backstory='Você trabalha em um laboratório de pesquisas avançadas',
        llm=llm_langchain # Passar a instância do Langchain LLM
    )
    ```
    *Nota: Ao usar um LLM Langchain, você também o passaria para a `Crew` se quisesse um LLM padrão para todas as tarefas/agentes que não tivessem um LLM específico.*

## Considerações e Boas Práticas (Aplicável a Ambas Abordagens)

*   **Nome do Modelo**: Sempre verifique o nome exato do modelo Gemini que você tem acesso e que é compatível com sua chave API (ex: `gemini-pro`, `gemini-1.5-flash`). Testes com `curl` podem ajudar a confirmar.
*   **Chaves API**: Mantenha suas chaves API seguras e use variáveis de ambiente.
*   **Limites de Uso**: Esteja ciente dos limites de requisição da API Gemini (ex: RPM - requisições por minuto). O parâmetro `max_rpm` (se disponível na sua biblioteca LLM) pode ajudar. Caso contrário, implemente controle de taxa no seu código se fizer muitas chamadas.
*   **Prompts de Sistema (`system_prompt`)**: Verifique a documentação do modelo Gemini específico que você está usando. Alguns modelos podem não suportar prompts de sistema da mesma forma que outros. O parâmetro `use_system_prompt=False` pode ser necessário com `ChatGoogleGenerativeAI`.
*   **Gerenciamento de Contexto (`respect_context_window`)**: Se estiver usando `ChatGoogleGenerativeAI`, ativar `respect_context_window=True` (ou funcionalidade similar) é importante para evitar exceder a janela de tokens em conversas longas.
*   **Monitoramento de Erros**: Implemente tratamento de exceções (`try-except`) robusto em torno das suas chamadas LLM para capturar e lidar com falhas de rede, erros da API, ou problemas de limite de taxa.
*   **Workaround `OPENAI_`**: Evite usar workarounds como definir `OPENAI_MODEL_NAME` para modelos Gemini se a configuração direta (como as descritas acima) funcionar. Essas soluções alternativas podem levar a comportamentos inesperados ou erros de conectividade.
*   **Conectividade**: Certifique-se de que o ambiente onde o código executa tenha conectividade de rede e resolução DNS adequadas para alcançar `generativelanguage.googleapis.com`.

Seguindo estas diretrizes, a integração do Gemini com CrewAI deve ser mais estável e previsível. 