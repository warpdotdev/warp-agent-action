# Warp Agent Action

This action supports running the Warp Agent in GitHub Actions. It wraps the [Warp CLI](https://docs.warp.dev/developers/cli) with:
* Caching for package installation
* Capturing output for subsequent steps

## Quickstart

To get started, you'll need a [Warp API Key](https://docs.warp.dev/developers/cli#api-key-authentication). We recommend storing this key as a [secret](https://docs.github.com/en/actions/concepts/security/secrets) in your repository or organization.

Then, add a step to your workflow that runs Warp:

```yaml
- name: Review code changes in Warp
  uses: warpdotdev/warp-agent-action@main
  with:
    prompt: |
      Review the code changes on this branch:
      1. Use the `git` command to identify changes from the base branch
      2. Thoroughly analyze all changes, and identify any issues with style, security, or correctness
      3. If you have suggestions, use the `gh` command to comment on the PR.
    warp_api_key: ${{ secrets.WARP_API_KEY }}
```

## Helpful Tips

* Inject relevant context from the GitHub event and previous steps into your Warp prompt via templating.
* Warp's output is available as `steps.${step_id}.outputs.agent_output`. Use the `output_format: json` option to get machine-readable agent output!
* For debugging, use the `share` option to automatically share the agent's session with your teammates. See the [Session Sharing](https://docs.warp.dev/knowledge-and-collaboration/session-sharing) documentation for more info.

See the [action definition](./action.yaml) for all options.