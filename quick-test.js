const { spawn } = require('child_process');
const http = require('http');

// Try to start the server
const serverProcess = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: 'C:\\Users\\hp\\OneDrive\\Desktop\\VeerWell 2.0\\server',
  stdio: 'pipe',
  shell: true
});

let serverReady = false;
let attempts = 0;

const checkServer = () => {
  const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/stress', method: 'GET' }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Server is running! Status:', res.statusCode);
      console.log('Response:', data.substring(0, 200));
      serverReady = true;
      testAiChat();
    });
  });
  req.on('error', (e) => {
    attempts++;
    if (attempts < 10 && !serverReady) {
      setTimeout(checkServer, 1000);
    } else {
      console.log('Server not responding after retries');
    }
  });
  req.end();
};

checkServer();

// After 15 seconds, if server not ready, kill and try again
setTimeout(() => {
  if (!serverReady) {
    console.log('Server startup timed out, trying alternative...');
    serverProcess.kill();
    // Try running the bat file approach
    const { exec } = require('child_process');
    exec('cmd /c start "" /B "C:\\Users\\hp\\OneDrive\\Desktop\\VeerWell 2.0\\server\\start.bat"', (error, stdout, stderr) => {
      if (error) console.error('Error:', error);
    });
    setTimeout(checkServer, 3000);
  }
}, 15000);

function testAiChat() {
  setTimeout(() => {
    const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/chat', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('AI Chat Response Status:', res.statusCode);
        console.log('AI Chat Response:', data.substring(0, 300));
      });
    });
    req.on('error', (e) => console.error('Chat error:', e));
    req.write(JSON.stringify({ message: 'Hello Rakshak AI' }));
    req.end();
  }, 2000);
}