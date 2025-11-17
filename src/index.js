import * as process from 'process'
import * as path from 'path'

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import * as http from '@actions/http-client'

// Run Warp's agent.
async function runAgent() {
  const channel = core.getInput('warp_channel')
  const prompt = core.getInput('prompt')
  const savedPrompt = core.getInput('saved_prompt')

  if (!prompt && !savedPrompt) {
    throw new Error('Either `prompt` or `saved_prompt` must be provided')
  }

  const apiKey = core.getInput('warp_api_key')
  if (!apiKey) {
    throw new Error('`warp_api_key` must be provided.')
  }

  let command
  switch (channel) {
    case 'stable':
      command = 'warp-cli'
      break
    case 'preview':
      command = 'warp-cli-preview'
      break
    default:
      throw new Error(`Unsupported channel ${channel}`)
  }

  await installWarp(channel, core.getInput('warp_version'))

  let args = ['agent', 'run']

  if (prompt) {
    args.push('--prompt', prompt)
  }

  if (savedPrompt) {
    args.push('--saved-prompt', savedPrompt)
  }

  const cwd = core.getInput('cwd')
  if (cwd) {
    args.push('--cwd', cwd)
  }
  const profile = core.getInput('profile')
  if (profile) {
    args.push('--profile', profile)
  }

  const outputFormat = core.getInput('output_format')
  if (outputFormat) {
    args.push('--output-format', outputFormat)
  }

  const shareRecipients = core.getMultilineInput('share')
  if (shareRecipients) {
    for (const recipient of shareRecipients) {
      args.push('--share', recipient)
    }
  }

  // In debug mode, show Warp logs on stderr.
  if (core.isDebug()) {
    args.push('--debug')
  }

  const { stdout } = await exec.getExecOutput(command, args, {
    env: {
      ...process.env,
      WARP_API_KEY: apiKey
    }
  })

  core.setOutput('agent_output', stdout)
}

// Install the Warp CLI, using the specified channel and version.
async function installWarp(channel, version) {
  await core.group('Installing Warp', async () => {
    const warpDeb = await downloadWarpDeb(channel, version)
    // Install the .deb file, and then use apt-get to install any dependencies.
    await exec.exec('sudo', ['dpkg', '-i', warpDeb])
    await exec.exec('sudo', ['apt-get', '-f', 'install'])
  })
}

// Download the .deb file for the Warp CLI. If the version is `latest`, this will resolve the
// latest version on `channel`.
async function downloadWarpDeb(channel, version) {
  if (process.platform !== 'linux') {
    throw new Error(
      `Only Linux runners are supported - the current platform is ${process.platform}`
    )
  }

  let debUrl
  let arch
  let debArch

  if (process.arch === 'x64') {
    arch = 'x86_64'
    debArch = 'amd64'
  } else if (process.arch === 'arm64') {
    arch = 'aarch64'
    debArch = 'arm64'
  } else {
    throw new Error(`Unsupported architecture ${process.arch}`)
  }

  if (version === 'latest') {
    const client = new http.HttpClient('warp-cli-action', undefined, { allowRedirects: false })
    const response = await client.get(
      `https://app.warp.dev/download/cli?os=linux&package=deb&arch=${arch}&channel=${channel}`
    )

    if (response.message.statusCode === 302 || response.message.statusCode === 301) {
      debUrl = response.message.headers['location']
      const url = new URL(debUrl)
      const pathComponents = url.pathname.split('/').filter((c) => c)
      // Extract the version component from the URL.
      if (pathComponents.length >= 2) {
        version = pathComponents[1]
      }
    } else {
      throw new Error(`Expected redirect, got status ${response}`)
    }

    core.info(`Latest version on ${channel} is ${version}`)
  } else {
    let debVersion
    if (version.startsWith('v')) {
      debVersion = version.slice(1)
    } else {
      debVersion = version
      version = 'v' + version
    }
    debUrl = `https://releases.warp.dev/${channel}/${version}/warp-cli-${channel}_${debVersion}_${debArch}.deb`
  }

  const cacheVersion = `${channel}-${version}`
  let cachedDeb = tc.find('warp-cli', cacheVersion)
  if (!cachedDeb) {
    core.debug(`Downloading from ${debUrl}...`)
    const downloadedDeb = await tc.downloadTool(debUrl)
    cachedDeb = await tc.cacheFile(downloadedDeb, 'warp-cli.deb', 'warp-cli', cacheVersion)
  } else {
    core.debug('Using cached .deb package')
  }
  return path.join(cachedDeb, 'warp-cli.deb')
}

try {
  await runAgent()
} catch (error) {
  core.setFailed(error.message)
}
