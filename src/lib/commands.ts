interface RepoData {
  repos: any[]
  languages: { [key: string]: number }
  totalStars: number
  totalForks: number
}

export async function executeCommand(
  command: string,
  userData: any,
  repoData: RepoData | null
): Promise<string> {
  const cmd = command.toLowerCase().trim()

  switch (cmd) {
    case 'help':
      return `
+================================================================+
|                      AVAILABLE COMMANDS                        |
+================================================================+
|  help      - Show this help menu                               |
|  about     - Display developer bio and background              |
|  skills    - List technical skills and proficiencies           |
|  projects  - Show featured projects and repositories           |
|  stats     - Display GitHub statistics and metrics             |
|  contact   - Get contact information and social links          |
|  clear     - Clear terminal screen                             |
+================================================================+

TIP: Use arrow keys to navigate command history
TIP: Press Tab to auto-complete commands
`

    case 'about':
      return `
+================================================================+
|                         ABOUT ME                               |
+================================================================+

> Name: ${userData?.login || 'GitHub Developer'}
> Role: Full-Stack Developer & Open Source Contributor
> Location: Remote / Global

${userData?.bio || 'Passionate developer building impactful software solutions.'}

I specialize in creating elegant, performant web applications with a
focus on user experience and clean code architecture. My work spans
across multiple technologies and domains, always pushing to learn and
improve.

> Profile: https://github.com/${userData?.login || 'username'}
`

    case 'skills':
      if (!repoData || !repoData.languages) {
        return 'Loading skills data...'
      }

      const languages = Object.entries(repoData.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)

      const total = languages.reduce((sum, [, val]) => sum + val, 0)

      let output = `
+================================================================+
|                      TECHNICAL SKILLS                          |
+================================================================+

>> PRIMARY LANGUAGES
`

      languages.forEach(([lang, bytes]) => {
        const percentage = ((bytes / total) * 100).toFixed(1)
        const barLength = Math.floor((bytes / total) * 30)
        const bar = '█'.repeat(barLength) + '░'.repeat(30 - barLength)
        output += `\n   ${lang.padEnd(15)} [${bar}] ${percentage}%`
      })

      output += `\n
>> TECH STACK
   • Frontend: React, TypeScript, Tailwind CSS
   • Backend: Node.js, Express, REST APIs
   • Tools: Git, GitHub, VS Code, Docker
   • Practices: Agile, TDD, CI/CD, Code Review
`

      return output

    case 'projects':
      if (!repoData || !repoData.repos || repoData.repos.length === 0) {
        return 'Loading projects data...'
      }

      const topRepos = repoData.repos
        .filter((r: any) => !r.fork)
        .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 5)

      let projectOutput = `
+================================================================+
|                      FEATURED PROJECTS                         |
+================================================================+
`

      topRepos.forEach((repo: any, index: number) => {
        projectOutput += `\n
>> [${index + 1}] ${repo.name}
   ${repo.description || 'No description available'}
   
   Language: ${repo.language || 'Multiple'}
   Stars: ⭐ ${repo.stargazers_count || 0} | Forks: 🔱 ${repo.forks_count || 0}
   URL: ${repo.html_url}
`
      })

      return projectOutput

    case 'stats':
      if (!repoData) {
        return 'Loading statistics...'
      }

      return `
+================================================================+
|                      GITHUB STATISTICS                         |
+================================================================+

>> REPOSITORY METRICS
   Total Repositories:     ${repoData.repos.length}
   Public Repos:           ${repoData.repos.filter((r: any) => !r.private).length}
   Total Stars Received:   ⭐ ${repoData.totalStars}
   Total Forks:            🔱 ${repoData.totalForks}

>> ACTIVITY
   Active Projects:        ${repoData.repos.filter((r: any) => !r.archived).length}
   Archived:               ${repoData.repos.filter((r: any) => r.archived).length}
   
>> LANGUAGES
   Primary Language:       ${Object.entries(repoData.languages).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'}
   Language Diversity:     ${Object.keys(repoData.languages).length} languages

>> PROFILE
   GitHub: https://github.com/${userData?.login || 'username'}
`

    case 'contact':
      return `
+================================================================+
|                      CONTACT INFORMATION                       |
+================================================================+

>> CONNECT WITH ME

   GitHub:     https://github.com/${userData?.login || 'username'}
   Email:      ${userData?.email || 'Available on GitHub profile'}
   
>> SOCIAL LINKS
   
   Portfolio:  https://${userData?.login || 'username'}.github.io
   LinkedIn:   Connect via GitHub profile
   Twitter:    Follow via GitHub profile

>> OPEN FOR
   
   ✓ Collaboration on open source projects
   ✓ Technical discussions and code reviews
   ✓ Freelance opportunities
   ✓ Speaking engagements

Feel free to reach out! I'm always interested in connecting with
fellow developers and working on exciting projects.
`

    case 'clear':
      return 'CLEAR'

    default:
      return `
+================================================================+
|                          ERROR                                 |
+================================================================+

Command not found: "${command}"

Type 'help' to see available commands.
`
  }
}
