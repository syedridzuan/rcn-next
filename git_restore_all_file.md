To restore all files from a specific Git tag and delete files created after the commit of that tag, follow these steps:

### 1. **Check out the tag**
First, check out the specific tag you want to restore:

```bash
git checkout <tag-name>
```

This will move your working directory to the state of the tag. However, this is a detached HEAD state, meaning you are not on a branch.

### 2. **Delete files not tracked by Git**
To remove files created after the tag (and not tracked by Git), use the following command:

```bash
git clean -fd
```

- `-f`: Force deletion of untracked files.
- `-d`: Remove untracked directories as well.

**Optional**: Add `-x` if you want to delete files ignored by `.gitignore`.

### 3. **Switch back to a branch if necessary**
If you want to restore the state from the tag to a specific branch, you can reset the branch to the tag commit.

#### Checkout the branch
```bash
git checkout <branch-name>
```

#### Reset the branch to the tag
```bash
git reset --hard <tag-name>
```

### 4. **Push changes (optional)**
If you want to update the remote branch to match the state of the tag, force-push it:

```bash
git push origin <branch-name> --force
```

### Summary of Actions
1. `git checkout <tag-name>` to move to the tag's state.
2. `git clean -fd` to remove untracked files and directories.
3. `git reset --hard <tag-name>` to reset to the tag state.
4. Force-push if necessary: `git push origin <branch-name> --force`.

### Notes
- Use these commands cautiously, especially `git reset --hard` and `git clean`, as they will permanently delete changes and untracked files.
- Ensure you have committed or backed up any important work before performing these operations.