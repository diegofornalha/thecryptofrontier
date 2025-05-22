# Instruções para Configurar o Cron do Pipeline de Blog

## Horário de Execução

O pipeline está configurado para rodar **todos os dias às 21:00 (9 PM) no horário de São Paulo**.

## Como Instalar o Cron

1. No seu servidor, execute o comando:
   ```bash
   crontab -e
   ```

2. Adicione a seguinte linha ao final do arquivo:
   ```
   0 21 * * * export TZ="America/Sao_Paulo" && /home/sanity/thecryptofrontier/framework_crewai/blog_crew/daily_pipeline.sh
   ```

3. Salve e feche o editor.

4. Para verificar se o cron foi instalado corretamente:
   ```bash
   crontab -l
   ```

## Observações Importantes

- A variável `TZ="America/Sao_Paulo"` garante que o job seja executado considerando o horário de Brasília.
- O pipeline gera logs detalhados em `/home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log`.
- Aos domingos, o script também executa limpeza de duplicatas e sincronização completa com o Algolia.

## Ajustes de Horário (se necessário)

Se desejar alterar o horário posteriormente:

- Para executar em outro horário, altere os primeiros números (minuto e hora):
  ```
  0 21 * * *  # 21:00 (9 PM)
  0 9 * * *   # 09:00 (9 AM)
  30 13 * * * # 13:30 (1:30 PM)
  ```

- Para executar múltiplas vezes ao dia:
  ```
  0 9,15,21 * * * # Executa às 9 AM, 3 PM e 9 PM
  ```

## Solução de Problemas

Se o cron não estiver executando como esperado, verifique:

1. Se o script tem permissão de execução:
   ```bash
   chmod +x /home/sanity/thecryptofrontier/framework_crewai/blog_crew/daily_pipeline.sh
   ```

2. O arquivo de log para mensagens de erro:
   ```bash
   tail -100 /home/sanity/thecryptofrontier/framework_crewai/blog_crew/pipeline.log
   ```