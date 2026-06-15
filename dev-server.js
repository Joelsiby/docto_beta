const { spawn } = require('child_process');

spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--dns-result-order=ipv4first'
  }
});
