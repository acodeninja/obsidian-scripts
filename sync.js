#!/usr/bin/env node

import {syncGithubIssues} from "./sync-github-issues.js";
import {loadEnvironment} from "./environment.js";

await loadEnvironment();
await syncGithubIssues();
