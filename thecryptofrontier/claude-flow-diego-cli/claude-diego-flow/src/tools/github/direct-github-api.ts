import { Octokit } from '@octokit/rest';
import { BaseTool } from '../tool-interface';

export class DirectGitHubAPI extends BaseTool {
  name = 'DirectGitHubAPI';
  description = 'Acesso direto à API do GitHub';
  private octokit: Octokit;
  
  constructor() {
    super();
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      throw new Error('GITHUB_TOKEN não configurado');
    }
    
    this.octokit = new Octokit({
      auth: token
    });
  }
  
  async execute(params: any): Promise<any> {
    const { action, ...data } = params;
    
    switch (action) {
      case 'createIssue':
        return this.createIssue(data);
      case 'listIssues':
        return this.listIssues(data);
      case 'createPR':
        return this.createPullRequest(data);
      case 'listPRs':
        return this.listPullRequests(data);
      case 'createRepo':
        return this.createRepository(data);
      case 'getRepo':
        return this.getRepository(data);
      case 'createBranch':
        return this.createBranch(data);
      case 'getFile':
        return this.getFile(data);
      case 'createOrUpdateFile':
        return this.createOrUpdateFile(data);
      default:
        throw new Error(`Ação não suportada: ${action}`);
    }
  }
  
  private async createIssue(params: {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
  }): Promise<any> {
    try {
      const response = await this.octokit.issues.create({
        owner: params.owner,
        repo: params.repo,
        title: params.title,
        body: params.body,
        labels: params.labels,
        assignees: params.assignees
      });
      
      return {
        success: true,
        issue: {
          number: response.data.number,
          url: response.data.html_url,
          title: response.data.title,
          state: response.data.state
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async listIssues(params: {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    per_page?: number;
  }): Promise<any> {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: params.owner,
        repo: params.repo,
        state: params.state || 'open',
        labels: params.labels,
        sort: params.sort || 'created',
        per_page: params.per_page || 30
      });
      
      const issues = response.data.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        url: issue.html_url,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels.map(l => typeof l === 'string' ? l : l.name)
      }));
      
      return {
        success: true,
        issues,
        count: issues.length
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async createPullRequest(params: {
    owner: string;
    repo: string;
    title: string;
    head: string;
    base: string;
    body?: string;
    draft?: boolean;
  }): Promise<any> {
    try {
      const response = await this.octokit.pulls.create({
        owner: params.owner,
        repo: params.repo,
        title: params.title,
        head: params.head,
        base: params.base,
        body: params.body,
        draft: params.draft || false
      });
      
      return {
        success: true,
        pullRequest: {
          number: response.data.number,
          url: response.data.html_url,
          title: response.data.title,
          state: response.data.state,
          draft: response.data.draft
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async listPullRequests(params: {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'popularity' | 'long-running';
    per_page?: number;
  }): Promise<any> {
    try {
      const response = await this.octokit.pulls.list({
        owner: params.owner,
        repo: params.repo,
        state: params.state || 'open',
        sort: params.sort || 'created',
        per_page: params.per_page || 30
      });
      
      const pullRequests = response.data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        draft: pr.draft,
        head: pr.head.ref,
        base: pr.base.ref
      }));
      
      return {
        success: true,
        pullRequests,
        count: pullRequests.length
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async createRepository(params: {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
  }): Promise<any> {
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: params.name,
        description: params.description,
        private: params.private || false,
        auto_init: params.auto_init || true,
        gitignore_template: params.gitignore_template,
        license_template: params.license_template
      });
      
      return {
        success: true,
        repository: {
          name: response.data.name,
          full_name: response.data.full_name,
          html_url: response.data.html_url,
          clone_url: response.data.clone_url,
          private: response.data.private
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async getRepository(params: {
    owner: string;
    repo: string;
  }): Promise<any> {
    try {
      const response = await this.octokit.repos.get({
        owner: params.owner,
        repo: params.repo
      });
      
      return {
        success: true,
        repository: {
          name: response.data.name,
          full_name: response.data.full_name,
          description: response.data.description,
          html_url: response.data.html_url,
          clone_url: response.data.clone_url,
          private: response.data.private,
          default_branch: response.data.default_branch,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          stars: response.data.stargazers_count,
          forks: response.data.forks_count
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async createBranch(params: {
    owner: string;
    repo: string;
    branch: string;
    from?: string;
  }): Promise<any> {
    try {
      // Obter SHA do branch base
      const baseBranch = params.from || 'main';
      const { data: refData } = await this.octokit.git.getRef({
        owner: params.owner,
        repo: params.repo,
        ref: `heads/${baseBranch}`
      });
      
      // Criar novo branch
      const response = await this.octokit.git.createRef({
        owner: params.owner,
        repo: params.repo,
        ref: `refs/heads/${params.branch}`,
        sha: refData.object.sha
      });
      
      return {
        success: true,
        branch: {
          name: params.branch,
          sha: response.data.object.sha,
          url: response.data.url
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async getFile(params: {
    owner: string;
    repo: string;
    path: string;
    ref?: string;
  }): Promise<any> {
    try {
      const response = await this.octokit.repos.getContent({
        owner: params.owner,
        repo: params.repo,
        path: params.path,
        ref: params.ref
      });
      
      if ('content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        
        return {
          success: true,
          file: {
            path: response.data.path,
            sha: response.data.sha,
            size: response.data.size,
            content,
            encoding: 'utf-8'
          }
        };
      } else {
        return {
          success: false,
          error: 'Path is a directory, not a file'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  private async createOrUpdateFile(params: {
    owner: string;
    repo: string;
    path: string;
    message: string;
    content: string;
    branch?: string;
    sha?: string;
  }): Promise<any> {
    try {
      const contentBase64 = Buffer.from(params.content).toString('base64');
      
      const requestParams: any = {
        owner: params.owner,
        repo: params.repo,
        path: params.path,
        message: params.message,
        content: contentBase64,
        branch: params.branch
      };
      
      // Se sha fornecido, é uma atualização
      if (params.sha) {
        requestParams.sha = params.sha;
      }
      
      const response = await this.octokit.repos.createOrUpdateFileContents(requestParams);
      
      return {
        success: true,
        commit: {
          sha: response.data.commit.sha,
          message: response.data.commit.message,
          url: response.data.commit.html_url
        },
        content: {
          path: response.data.content?.path,
          sha: response.data.content?.sha
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Wrapper para compatibilidade
export class GitHubTool extends DirectGitHubAPI {
  async createIssue(owner: string, repo: string, title: string, body?: string) {
    return this.execute({ action: 'createIssue', owner, repo, title, body });
  }
  
  async listIssues(owner: string, repo: string, state?: string) {
    return this.execute({ action: 'listIssues', owner, repo, state });
  }
  
  async createPR(owner: string, repo: string, title: string, head: string, base: string, body?: string) {
    return this.execute({ action: 'createPR', owner, repo, title, head, base, body });
  }
}