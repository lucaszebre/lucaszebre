import { Octokit } from "@octokit/rest";
import { writeFileSync } from 'fs';

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
        const { data: repos } = await octokit.repos.listForUser({
            username: user.login,
            sort: 'pushed',
            direction: 'desc'
        });

        let content = `<h1 align="center">Hello There 😄 </h1>
### I'm a WEB Developer :)
#### 👷 Check out what I'm currently working on
`;

        repos.slice(0, 5).forEach(repo => {
            content += `- [${repo.name}](${repo.html_url}) - ${repo.description || ''} (${getTimeAgo(new Date(repo.pushed_at))})\n`;
        });

        content += `#### 🌱 My latest projects
`;

        repos.slice(0, 5).forEach(repo => {
            content += `- [${repo.name}](${repo.html_url}) - ${repo.description || ''} (${getTimeAgo(new Date(repo.created_at))})\n`;
        });

        content += `<a href="https://www.youtube.com/watch?v=nC9dQOnUyao"><img src="https://indianmemetemplates.com/wp-content/uploads/Computer-Guy.jpg"></a>
## By the way here are some of my statistics 🚀
![LeoMbm's Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=lucaszebre&theme=tokyonight&layout=compact)
🌱 Currently, i improve my skills in the testing area.
🧱 Front End : React, Tailwind, Bootstrap
🧱 Back End : Javascript(Node, Express),Firebase,Supabase
🧱 Database : PostgreSQL, MongoDB
🧱 Testing : Jest - React-testing , Vitest
<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"><img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"></a>
## Contact me : 
[![Gmail Badge](https://img.shields.io/badge/-lucaszebre1@gmail.com-blue?style=flat-roundedrectangle&logo=Gmail&logoColor=white&link=mailto:lucaszebre1@gmail.com)](lucaszebre1@gmail.com)
[![Twitter Badge](https://img.shields.io/badge/-@ZebreLucas-1ca0f1?style=flat-square&labelColor=1ca0f1&logo=twitter&logoColor=white&link=https://twitter.com/ZebreLucas)](https://twitter.com/ZebreLucas) 
![visitors](https://komarev.com/ghpvc/?username=lucaszebre&color=yellow)
`;

        writeFileSync('README.md', content);
        console.log('README updated successfully');
    } catch (error) {
        console.error('Error updating README:', error);
    }
}

updateReadme();