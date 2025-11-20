# Warp Agent Action

This action supports running the Warp Agent in GitHub Actions. It wraps the
[Warp CLI](https://docs.warp.dev/developers/cli) with:

- Caching for package installation
- Capturing output for subsequent steps

## Quickstart

To get started, you'll need a
[Warp API Key](https://docs.warp.dev/developers/cli#api-key-authentication). We recommend storing
this key as a [secret](https://docs.github.com/en/actions/concepts/security/secrets) in your
repository or organization.

Then, add a step to your workflow that runs Warp:

```yaml
- name: Review code changes in Warp
  uses: warpdotdev/warp-agent-action@v1
  with:
    prompt: |
      Review the code changes on this branch:
      1. Use the `git` command to identify changes from the base branch
      2. Thoroughly analyze all changes, and identify any issues with style, security, or correctness
      3. If you have suggestions, use the `gh` command to comment on the PR.
    warp_api_key: ${{ secrets.WARP_API_KEY }}
```

## Helpful Tips

- Inject relevant context from the GitHub event and previous steps into your Warp prompt via
  templating.
- Warp's output is available as `steps.${step_id}.outputs.agent_output`. Use the
  `output_format: json` option to get machine-readable agent output!
- For debugging, use the `share` option to automatically share the agent's session with your
  teammates. See the
  [Session Sharing](https://docs.warp.dev/knowledge-and-collaboration/session-sharing) documentation
  for more info.

See the [action definition](./action.yml) for all options.

## Example Workflows

This repository includes several example workflows in `examples/` that demonstrate how to use the
Warp Agent Action for common development tasks.

### Respond to Comment

_File: [examples/respond-to-comment.yml](examples/respond-to-comment.yml)_

**Usage:** Comment on a PR or Issue with `@warp-agent` (or your configured trigger phrase).

**Description:** Allows you to interact with the Agent directly in comments (e.g., "@warp-agent fix
this typo").

**Setup:**

- Ensure `WARP_API_KEY` is set in Repository Secrets.

**Expected Output:**

- The Agent replies to your comment with an answer or confirmation.
- If code changes were requested, the Agent commits them directly to the PR branch.

**When to use:** Interactive coding assistance during code review or issue triage.

### Auto PR Review

_File: [examples/review-pr.yml](examples/review-pr.yml)_

**Usage:** Runs automatically when a Pull Request is opened or marked ready for review.

**Description:** Analyzes the diff of the PR and provides code review feedback.

**Setup:**

- Ensure `WARP_API_KEY` is set in Repository Secrets.
- The Agent needs read access to contents and write access to pull-requests.

**Expected Output:**

- Inline comments on the PR diff highlighting potential bugs, security issues, or style
  improvements.
- A general summary comment if applicable.

**When to use:** Get immediate feedback on code changes before human review.

### Auto Fix Issue

_File: [examples/auto-fix-issue.yml](examples/auto-fix-issue.yml)_

**Usage:** Apply the label `warp-agent` to any GitHub Issue.

**Description:** Triggers when the label is applied, analyzes the issue, and attempts to write code
to fix it.

**Setup:**

- Ensure `WARP_API_KEY` is set in Repository Secrets.
- Action requires write permissions for contents, issues, and pull-requests.

**Expected Output:**

- If a fix is found: A new Pull Request (`fix/issue-NUMBER`) is created and linked to the issue.
- If no fix is found: The Agent comments on the issue explaining why.

**When to use:** Delegate bug fixes, small features, or chore tasks to the Warp Agent.

### Daily Issue Summary

_File: [examples/daily-issue-summary.yml](examples/daily-issue-summary.yml)_

**Usage:** Runs automatically on a schedule (every day at 9:00 UTC).

**Description:** Fetches issues created in the last 24 hours and generates a summary.

**Setup:**

- Ensure `WARP_API_KEY` is set in Repository Secrets.
- Ensure `SLACK_WEBHOOK_URL` is set in Repository Secrets to receive the report.

**Expected Output:** A Slack message containing a categorized summary of new issues (Bugs, Features,
etc.).

**When to use:** Keep your team aligned on incoming issues without manually checking GitHub.

### Fix Failing Checks

_File: [examples/fix-failing-checks.yml](examples/fix-failing-checks.yml)_

**Usage:** Triggers automatically when a specified workflow (e.g., "Continuous Integration") fails.

**Description:** Analyzes failure logs from the failed workflow to determine the cause and attempts
a fix.

**Setup:**

- Ensure `WARP_API_KEY` is set in Repository Secrets.
- Update the `workflow_run.workflows` list in the file to match your CI workflow names.

**Expected Output:**

- A new Pull Request containing the fix for the build or test failure.
- Comments on the original PR (if applicable) with a link to the fix.

**When to use:** Reduce downtime caused by broken builds or flaky tests.
