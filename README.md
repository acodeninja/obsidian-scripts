# Obsidian Scripts

## Up and Running

* In the terminal, navigate to your vault
* Run `git clone https://github.com/acodeninja/obsidian-scripts.git .scripts`
* `cd .scripts`
* `npm install`
* Create a file called `.secrets`
* Add the following content:
  ```dotenv
  GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxx
  ```
* `npm sync`

You should find a list of tasks relating to assigned completed an incomplete GitHub issues.

## Generating a GitHub Token

* Visit [Fine-grained Access Tokens](https://github.com/settings/tokens?type=beta)
* Generate a new token
* Give it a name
* Select "All Repositories"
* Select Repository Permissions > Issues and set to Read-Only
* Generate your token
* Add to the `.secrets` file:

```dotenv
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxx
```
