#!/usr/bin/env node

import {Octokit} from "octokit";
import {writeFile, mkdir} from "fs/promises";
import {dirname, resolve} from "path";
import {fileURLToPath} from 'url';
import {dateToISO} from "./util/formatters.js";
import {getUnderscoreGlobals, loadEnvironment} from "./util/environment.js";

const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

export const syncGithubIssues = async () => {
    await loadEnvironment();
    const octokit = new Octokit({
        auth: process.env['GITHUB_TOKEN'],
    });

    const {data: issues} = await octokit.request('GET /issues?filter=assigned&state=all&sort=created');

    const githubTasks = issues
        .filter(i => i.pull_request === undefined)
        .map(({
                  title,
                  url,
                  state,
                  created_at,
                  closed_at,
                  repository: {full_name},
              }) => {
            const created = `⏳ ${dateToISO(new Date(created_at))}`;
            const completed = closed_at ? `✅ ${dateToISO(new Date(closed_at))}` : '';

            return `- [${closed_at ? 'x' : ' '}] [${title}](${url})for #Work/Repositories/${full_name} ${created} ${completed}`;
        });

    console.log(`Found a total of ${githubTasks.length} GitHub issues`);

    githubTasks.unshift('');
    githubTasks.push('');

    try {
        await mkdir(resolve(__dirname, '..', '_synced'));
        console.log('Created _synced directory');
    } catch (e) {

    }

    await writeFile(resolve(__dirname, '..', '_synced', 'GitHub Issues.md'), githubTasks.join('\n'));
};

if (process.argv.find(a => a === __filename)) await syncGithubIssues();
