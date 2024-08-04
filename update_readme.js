import { Octokit } from "@octokit/rest";
const fs = require('fs');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 30) {
        return `${Math.floor(days / 30)} months ago`;
    } else if (days > 0) {
        return `${days} days ago`;
    } else if (hours > 0) {
        return `${hours} hours ago`;
    } else if (minutes > 0) {
        return `${minutes} minutes ago`;
    } else {
        return "just now";
    }
}

async function updateReadme() {
    try {
        const { data: user } = await octokit.users.getAuthenticated();

        // Read existing README
        let readmeContent = fs.readFileSync('README.md', 'utf8');

        // Define sections to update
        const sections = [
            {
                title: "#### 👷 Check out what I'm currently working on",
                endMarker: "#### 🌱 My latest projects"
            },
            {
                title: "#### 🌱 My latest projects",
                endMarker: '<a href="https://www.youtube.com/watch?v=nC9dQOnUyao">'
            }
        ];

        for (const section of sections) {
            const sectionStart = readmeContent.indexOf(section.title);
            const sectionEnd = readmeContent.indexOf(section.endMarker, sectionStart);
            
            if (sectionStart !== -1 && sectionEnd !== -1) {
                const sectionContent = readmeContent.slice(sectionStart, sectionEnd);
                const repos = sectionContent.match(/- \[([^\]]+)\]\(([^)]+)\)(.*)/g);

                if (repos) {
                    const updatedRepos = await Promise.all(repos.map(async (repo) => {
                        const [, name, url] = repo.match(/- \[([^\]]+)\]\(([^)]+)\)/);
                        const owner = url.split('/')[3];
                        const repo_name = url.split('/')[4];

                        try {
                            const { data: repoData } = await octokit.repos.get({ owner, repo: repo_name });
                            const timeAgo = getTimeAgo(new Date(repoData.pushed_at));
                            return `- [${name}](${url}) - ${repoData.description || ''} (${timeAgo})`;
                        } catch (error) {
                            console.error(`Error fetching repo data for ${name}:`, error);
                            return repo; // Keep original line if there's an error
                        }
                    }));

                    const updatedSectionContent = section.title + '\n' + updatedRepos.join('\n') + '\n';
                    readmeContent = readmeContent.replace(sectionContent, updatedSectionContent);
                }
            }
        }

        // Write updated content back to README
        fs.writeFileSync('README.md', readmeContent);
        console.log('README updated successfully');
    } catch (error) {
        console.error('Error updating README:', error);
    }
}

updateReadme();