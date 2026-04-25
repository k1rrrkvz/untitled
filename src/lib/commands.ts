interface RepoData {
  repos: any[]
  languages: { [key: string]: number }
  totalStars: number
  totalForks: number
}

interface FileSystem {
  [key: string]: {
    type: 'file' | 'directory'
    content?: string
    children?: FileSystem
  }
}

let currentPath = '~'

function createFileSystem(userData: any, repoData: RepoData | null): FileSystem {
  const repos = repoData?.repos || []
  const projectsDir: FileSystem = {}
  
  repos.slice(0, 10).forEach((repo: any) => {
    projectsDir[repo.name] = {
      type: 'file',
      content: `Name: ${repo.name}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Unknown'}
Stars: ${repo.stargazers_count || 0}
Forks: ${repo.forks_count || 0}
URL: ${repo.html_url}
Updated: ${new Date(repo.updated_at).toLocaleDateString()}`
    }
  })

  const languages = Object.entries(repoData?.languages || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  let skillsContent = `TECHNICAL SKILLS AND LANGUAGES\n${'='.repeat(50)}\n\n`
  languages.forEach(([lang, bytes]) => {
    const total = Object.values(repoData?.languages || {}).reduce((a, b) => a + b, 0)
    const percentage = ((bytes / total) * 100).toFixed(1)
    skillsContent += `${lang.padEnd(20)} ${percentage}%\n`
  })

  return {
    '~': {
      type: 'directory',
      children: {
        'about.txt': {
          type: 'file',
          content: `ABOUT ${userData?.login?.toUpperCase() || 'DEVELOPER'}
${'='.repeat(50)}

Name: ${userData?.login || 'GitHub Developer'}
Profile: https://github.com/${userData?.login || 'username'}
Bio: ${userData?.bio || 'Developer and open source contributor'}

${userData?.email ? `Email: ${userData.email}\n` : ''}
Location: Remote / Global
Role: Full-Stack Developer & Open Source Contributor

I specialize in building elegant web applications with clean
architecture and strong attention to detail. Always learning
and contributing to the open source community.`
        },
        'skills.txt': {
          type: 'file',
          content: skillsContent
        },
        'contact.txt': {
          type: 'file',
          content: `CONTACT INFORMATION
${'='.repeat(50)}

GitHub:    https://github.com/${userData?.login || 'username'}
Email:     ${userData?.email || 'See GitHub profile'}
Website:   https://${userData?.login || 'username'}.github.io

Feel free to reach out for:
- Open source collaboration
- Project discussions
- Technical consulting
- Speaking opportunities`
        },
        'README.md': {
          type: 'file',
          content: `# Welcome to ${userData?.login || 'my'}'s terminal

This is an interactive Unix-style shell showcasing my GitHub profile.

## Available Commands

Standard Unix commands:
- ls          list directory contents
- cd [dir]    change directory
- cat [file]  display file contents
- pwd         print working directory
- clear       clear the terminal
- whoami      display current user
- date        show current date/time
- echo [text] print text
- history     show command history
- help        show this help

Special commands:
- stats       show GitHub statistics
- neofetch    display system info

Try 'ls' to see available files, or 'cat README.md' to read this file.`
        },
        'projects': {
          type: 'directory',
          children: projectsDir
        }
      }
    }
  }
}

function resolvePath(path: string): string {
  if (path === '~' || path === '') return '~'
  if (path === '/') return '~'
  if (path === '.') return currentPath
  if (path === '..') {
    if (currentPath === '~') return '~'
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    return parts.length === 0 ? '~' : parts.join('/')
  }
  if (path.startsWith('~/')) return path
  if (path.startsWith('/')) return '~' + path
  if (currentPath === '~') return `~/${path}`
  return `${currentPath}/${path}`
}

function getNode(fs: FileSystem, path: string): any {
  if (path === '~') return fs['~']
  const parts = path.replace(/^~\/?/, '').split('/').filter(Boolean)
  let current = fs['~']
  
  for (const part of parts) {
    if (!current.children || !current.children[part]) return null
    current = current.children[part]
  }
  return current
}

export async function executeCommand(
  command: string,
  userData: any,
  repoData: RepoData | null
): Promise<string> {
  const parts = command.trim().split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)
  
  const fs = createFileSystem(userData, repoData)

  switch (cmd) {
    case 'ls':
    case 'dir': {
      const targetPath = args[0] ? resolvePath(args[0]) : currentPath
      const node = getNode(fs, targetPath)
      
      if (!node) return `ls: ${args[0]}: No such file or directory`
      if (node.type !== 'directory') return `ls: ${args[0]}: Not a directory`
      
      const items = Object.keys(node.children || {}).sort()
      if (items.length === 0) return ''
      
      const dirs = items.filter(name => node.children![name].type === 'directory')
      const files = items.filter(name => node.children![name].type === 'file')
      
      let output = ''
      if (dirs.length > 0) {
        output += dirs.map(d => `\x1b[34m${d}/\x1b[0m`).join('  ')
      }
      if (files.length > 0) {
        if (output) output += '  '
        output += files.join('  ')
      }
      return output
    }

    case 'cd': {
      if (args.length === 0) {
        currentPath = '~'
        return ''
      }
      
      const targetPath = resolvePath(args[0])
      const node = getNode(fs, targetPath)
      
      if (!node) return `cd: ${args[0]}: No such file or directory`
      if (node.type !== 'directory') return `cd: ${args[0]}: Not a directory`
      
      currentPath = targetPath
      return ''
    }

    case 'pwd':
      return currentPath

    case 'cat': {
      if (args.length === 0) return 'cat: missing file operand'
      
      const targetPath = resolvePath(args[0])
      const node = getNode(fs, targetPath)
      
      if (!node) return `cat: ${args[0]}: No such file or directory`
      if (node.type === 'directory') return `cat: ${args[0]}: Is a directory`
      
      return node.content || ''
    }

    case 'whoami':
      return userData?.login || 'guest'

    case 'date':
      return new Date().toString()

    case 'echo':
      return args.join(' ')

    case 'clear':
      return 'CLEAR'

    case 'help': {
      return `Available commands:

File system:
  ls [dir]       list directory contents
  cd [dir]       change directory  
  pwd            print working directory
  cat [file]     display file contents

Information:
  whoami         display current user
  date           show current date and time
  echo [text]    print text to terminal
  stats          show GitHub statistics
  neofetch       display system information

Utility:
  history        show command history
  clear          clear terminal screen
  help           show this help message

Try these:
  ls                  - see available files
  cat README.md       - read the introduction
  cat about.txt       - learn about me
  cd projects && ls   - browse my projects
  stats               - view GitHub stats`
    }

    case 'history':
      return 'Use arrow keys (↑/↓) to navigate command history'

    case 'stats': {
      if (!repoData) return 'Loading GitHub statistics...'
      
      const totalRepos = repoData.repos.length
      const publicRepos = repoData.repos.filter((r: any) => !r.private).length
      const languages = Object.keys(repoData.languages).length
      const topLang = Object.entries(repoData.languages).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]
      
      return `GitHub Statistics for ${userData?.login}
${'='.repeat(50)}

Repositories:    ${totalRepos} (${publicRepos} public)
Total Stars:     ${repoData.totalStars}
Total Forks:     ${repoData.totalForks}
Languages:       ${languages}
Top Language:    ${topLang || 'N/A'}

Profile:         https://github.com/${userData?.login}`
    }

    case 'neofetch': {
      const user = userData?.login || 'guest'
      const repos = repoData?.repos.length || 0
      const stars = repoData?.totalStars || 0
      const langs = Object.keys(repoData?.languages || {}).length
      const topLang = Object.entries(repoData?.languages || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'
      
      return `        ___           ${user}@github.com
       (o o)          -------------------------
      (  =  )         OS: Web Terminal v2.0
       -----          Shell: spark-sh
      |     |         Theme: Developer Red
      |_____|         Repos: ${repos}
                      Stars: ${stars}
                      Languages: ${langs}
                      Primary: ${topLang}`
    }

    case '':
      return ''

    default:
      return `${cmd}: command not found. Type 'help' for available commands.`
  }
}
