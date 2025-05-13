import unittest
import subprocess
import sys
import os
from pathlib import Path
import time
import shutil
import json
from datetime import datetime # Importar datetime

# Determina o diretório raiz do projeto (framework_crewai)
# Assume que este script está em framework_crewai/src/blog_automacao/
PROJECT_ROOT = Path(__file__).parent.parent.parent
SRC_ROOT = PROJECT_ROOT / "src"
MAIN_MODULE = "src.blog_automacao.main"

# Diretórios de teste
TEST_DIR = PROJECT_ROOT / "temp_test_dir_single_post" # Nome diferente para evitar conflito
POSTS_PARA_TRADUZIR = TEST_DIR / "posts_para_traduzir"
POSTS_TRADUZIDOS = TEST_DIR / "posts_traduzidos"
POSTS_PUBLICADOS = TEST_DIR / "posts_publicados"
# Não precisamos simular o DUMMY_ARTICLE_DATA_TRADUZIDO, pois a crew real irá criá-lo.

class TestSinglePostE2E(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Configuração inicial para todos os testes."""
        print("\n" + "="*20 + " ATENÇÃO " + "="*20)
        print("Este teste End-to-End executará o fluxo de TRADUÇÃO e PUBLICAÇÃO para um post.")
        print("Fará chamadas REAIS para o LLM (Gemini) e Sanity CMS.")
        print("Certifique-se de que as variáveis de ambiente (GEMINI, SANITY) estão configuradas.")
        print("Considere usar um dataset de TESTE no Sanity.")
        print("="*50 + "\n")
        time.sleep(3) # Pequena pausa para ler o aviso

        # Limpar e criar diretórios de teste
        if TEST_DIR.exists():
            shutil.rmtree(TEST_DIR)
        TEST_DIR.mkdir(parents=True, exist_ok=True) # Garantir criação
        POSTS_PARA_TRADUZIR.mkdir()
        POSTS_TRADUZIDOS.mkdir()
        POSTS_PUBLICADOS.mkdir()

    @classmethod
    def tearDownClass(cls):
        """Limpeza após todos os testes."""
        print(f"\nDiretório de teste: {TEST_DIR}")
        print("Comente a linha `shutil.rmtree(TEST_DIR)` em tearDownClass para inspecionar os arquivos.")
        # Descomente a linha abaixo para limpar automaticamente após os testes
        # try:
        #     shutil.rmtree(TEST_DIR)
        # except OSError as e:
        #     print(f"Erro ao limpar diretório de teste {TEST_DIR}: {e}")
        pass

    def _run_main_script(self, args):
        """Executa o main.py como um subprocesso."""
        # Tentar usar python3 explicitamente, pois 'python' pode não estar no PATH ou ser python2
        # Se sys.executable já for 'python3' ou um caminho para python3, isto é seguro.
        # Caso contrário, tenta 'python3' como um comando geral.
        python_executable = "python3" 
        if sys.executable and ("python3" in Path(sys.executable).name or "pypy3" in Path(sys.executable).name):
            python_executable = sys.executable
            
        command = [python_executable, "-m", MAIN_MODULE] + args
        print(f"\n--- Executando Comando ---")
        print(f"{' '.join(command)}")
        print(f"CWD: {PROJECT_ROOT}")
        print(f"-------------------------")
        # Roda a partir do diretório raiz para que os caminhos relativos funcionem
        # e para que o .env seja carregado, se existir
        result = subprocess.run(command, capture_output=True, text=True, cwd=PROJECT_ROOT, env=os.environ)
        print("--- STDOUT --- ")
        print(result.stdout)
        print("--- STDERR --- ")
        print(result.stderr)
        print(f"--- Exit Code: {result.returncode} ---")
        return result

    def test_single_post_flow(self):
        """Testa o fluxo Monitoramento -> Tradução -> Publicação para um único post."""
        print("\n--- Iniciando Teste: test_single_post_flow ---")

        # 1. Setup: Limpar diretórios (já feito em setUpClass)
        initial_para_traduzir_count = len(list(POSTS_PARA_TRADUZIR.glob("*.json")))
        initial_traduzidos_count = len(list(POSTS_TRADUZIDOS.glob("*.json")))
        initial_publicados_count = len(list(POSTS_PUBLICADOS.glob("*.json")))
        self.assertEqual(initial_para_traduzir_count, 0, "Diretório posts_para_traduzir não estava vazio no início.")

        # 1.5 Executar Monitoramento
        print("\n--- Etapa 1.5: Executando Monitoramento (--monitoramento) ---")
        print(f"CWD: {Path.cwd()}")
        # print(f"TEST_DIR relative: {str(TEST_DIR.relative_to(Path.cwd() / \"framework_crewai\"))}")
        # cmd = [PYTHON_EXEC, "-m", "src.blog_automacao.main", "--monitoramento", "--base_dir", str(TEST_DIR.relative_to(Path.cwd() / \"framework_crewai\"))]
        cmd = [PYTHON_EXEC, "-m", "src.blog_automacao.main", "--monitoramento", "--base_dir", str(TEST_DIR)]

        result_mon = subprocess.run(cmd, capture_output=True, text=True, cwd=str(Path("framework_crewai")) )
        self.assertEqual(result_mon.returncode, 0, f"Monitoramento falhou com código de saída {result_mon.returncode}")
        # Verificar se pelo menos um arquivo foi criado
        files_para_traduzir = list(POSTS_PARA_TRADUZIR.glob("*.json"))
        self.assertGreater(len(files_para_traduzir), initial_para_traduzir_count, "Nenhum arquivo foi encontrado em posts_para_traduzir após o monitoramento.")
        # Pegar o primeiro arquivo encontrado para as próximas etapas
        file_para_traduzir = files_para_traduzir[0]
        print(f"Arquivo encontrado para tradução: {file_para_traduzir}")

        # 2. Executar Tradução
        print("\n--- Etapa 2: Executando Tradução (--traducao) ---")
        cmd_trad = [PYTHON_EXEC, "-m", "src.blog_automacao.main", "--traducao", "--base_dir", str(TEST_DIR)]
        result_trad = subprocess.run(cmd_trad, capture_output=True, text=True, cwd=str(Path("framework_crewai")))
        self.assertEqual(result_trad.returncode, 0, f"Tradução falhou com código de saída {result_trad.returncode}")
        # Verificar se o script de tradução reportou ter encontrado artigos
        self.assertRegex(result_trad.stdout, r"Encontrados \d+ artigos para traduzir.") # Usar regex para número variável
        self.assertIn(f"Processando tradução de: {file_para_traduzir.name}", result_trad.stdout)

        # 3. Verificar Resultado da Tradução
        print("\n--- Etapa 3: Verificando Resultado da Tradução ---")
        # Arquivo original deve ter sido removido por --traducao
        self.assertFalse(file_para_traduzir.exists(), f"Arquivo original {file_para_traduzir.name} não foi removido após tradução.")
        # Um novo arquivo deve existir em posts_traduzidos
        files_traduzidos = list(POSTS_TRADUZIDOS.glob("traduzido_*.json"))
        self.assertEqual(len(files_traduzidos), initial_traduzidos_count + 1, "Número incorreto de arquivos encontrados em posts_traduzidos.")
        file_traduzido = files_traduzidos[0] # Assumindo que só um foi processado
        print(f"Arquivo encontrado em posts_traduzidos: {file_traduzido}")

        # 4. Executar Publicação
        print("\n--- Etapa 4: Executando Publicação (--publicacao) ---")
        cmd_pub = [PYTHON_EXEC, "-m", "src.blog_automacao.main", "--publicacao", "--base_dir", str(TEST_DIR)]
        result_pub = subprocess.run(cmd_pub, capture_output=True, text=True, cwd=str(Path("framework_crewai")))
        self.assertEqual(result_pub.returncode, 0, f"Publicação falhou com código de saída {result_pub.returncode}")
        # Verificar se o script de publicação reportou ter encontrado artigos
        self.assertRegex(result_pub.stdout, r"Encontrados \d+ artigos para publicar.") # Usar regex
        self.assertIn(f"Processando publicação de: {file_traduzido.name}", result_pub.stdout)
        # Verificar se a mensagem de sucesso da publicação está no log
        # Pode falhar se a SanityPublishTool retornar algo diferente ou se a publicação falhar
        self.assertIn("Post publicado/atualizado com sucesso", result_pub.stdout, "Mensagem de sucesso da publicação não encontrada no stdout.")

        # 5. Verificar Resultado da Publicação
        print("\n--- Etapa 5: Verificando Resultado da Publicação ---")
        # Arquivo traduzido deve ter sido movido/removido por --publicacao
        self.assertFalse(file_traduzido.exists(), f"Arquivo traduzido {file_traduzido.name} não foi removido/movido após publicação.")
        # Um novo arquivo deve existir em posts_publicados
        files_publicados = list(POSTS_PUBLICADOS.glob("publicado_*.json"))
        self.assertGreaterEqual(len(files_publicados), initial_publicados_count + 1, "Nenhum arquivo encontrado em posts_publicados ou número incorreto.") # Usar GreaterEqual caso mais de um seja publicado
        print(f"Arquivo(s) encontrado(s) em posts_publicados: {[f.name for f in files_publicados]}")
        print("\n--- Teste: test_single_post_flow Concluído ---")

# Remover os testes antigos que não são mais relevantes para este foco
# def test_01_monitoramento_direto(self):
# ... (removido)
# def test_02_monitoramento_crewai(self):
# ... (removido)
# def test_03_traducao_crewai(self): # Lógica movida para test_single_post_flow
# ... (removido)
# def test_04_publicacao_crewai(self): # Lógica movida para test_single_post_flow
# ... (removido)
# def test_05_completo_crewai(self):
# ... (removido)

if __name__ == '__main__':
    # Garante que o diretório src esteja no PYTHONPATH para imports como src.blog_automacao.main
    # Necessário se rodar `python src/blog_automacao/test_main_e2e.py` diretamente
    if str(SRC_ROOT.parent) not in sys.path:
         # Adicionar o diretório PAI de SRC_ROOT (ou seja, framework_crewai) ao path
         # para que `import src.blog_automacao` funcione
        sys.path.insert(0, str(SRC_ROOT.parent))
        print(f"Adicionado {SRC_ROOT.parent} ao sys.path")

    # Roda os testes
    unittest.main() 